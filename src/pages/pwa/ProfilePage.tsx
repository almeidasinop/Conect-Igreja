import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Church, MapPin, PhoneCall, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Declara a variável global da face-api
declare const faceapi: any;

// Componente para a Câmera de Cadastro Facial (em um Modal)
const FacialCaptureModal = ({ onClose, onCaptureSuccess }: { onClose: () => void, onCaptureSuccess: (descriptor: number[]) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Iniciando câmera...');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // CORREÇÃO: Carrega os modelos de IA quando o modal é aberto
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      setStatus('Carregando modelos de IA...');
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('Posicione seu rosto no centro');
      } catch (error) {
        console.error("Erro ao carregar modelos da face-api:", error);
        setStatus('Erro ao carregar modelos.');
      }
    };
    loadModels();
  }, []);

  // Inicia a câmera ao montar o componente
  useEffect(() => {
    if (modelsLoaded) {
        const startVideo = () => {
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
              if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(() => setStatus('Erro ao acessar a câmera.'));
        };
        startVideo();
    }
  }, [modelsLoaded]);

  // Inicia a detecção facial quando o vídeo começa a tocar
  const handleVideoOnPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    const detectionInterval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused && modelsLoaded) {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();
        
        const canvas = canvasRef.current;
        if (canvas) {
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);
          const resizedDetection = faceapi.resizeResults(detection, displaySize);
          
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

          if (resizedDetection) {
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
            setIsFaceDetected(true);
            setStatus("Ótimo! Fique parado.");
          } else {
            setIsFaceDetected(false);
            setStatus("Posicione seu rosto no círculo.");
          }
        }
      }
    }, 400); // Roda a detecção a cada 400ms

    return () => clearInterval(detectionInterval);
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setStatus('Analisando...');
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const faceDescriptor = Array.from(detection.descriptor);
      onCaptureSuccess(faceDescriptor);
    } else {
      setStatus('Nenhum rosto detectado. Tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Cadastro Facial</h2>
        <div className={cn(
          "relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 transition-all",
          isFaceDetected ? "border-emerald-500 animate-pulse" : "border-gray-600"
        )}>
          <video ref={videoRef} autoPlay muted onPlay={handleVideoOnPlay} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
        <p className="text-white my-4 h-6">{status}</p>
        <div className="space-y-3">
          <button onClick={handleCapture} disabled={!isFaceDetected || !modelsLoaded} className="w-full py-3 bg-emerald-500 rounded-full font-bold disabled:bg-gray-500 disabled:opacity-50 transition-all">Capturar Rosto</button>
          <button onClick={onClose} className="w-full py-3 bg-gray-600 rounded-full font-bold">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// Componente de Cabeçalho Padrão para as Páginas do PWA
const PageHeader = ({ title }: { title: string }) => (
  <header className="sticky top-0 bg-black z-10 p-4 text-center border-b border-neutral-800">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

// OTIMIZAÇÃO: Mover FormSection para fora e usar React.memo para evitar re-renderizações desnecessárias.
const FormSection = React.memo(({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><span className="text-emerald-400">{icon}</span>{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
));


// Componente Principal da Página de Perfil
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isFacialModalOpen, setFacialModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<any>({});

  // OTIMIZAÇÃO: Lógica de busca de dados mais robusta.
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualização de estado em componente desmontado

    const fetchUserData = async () => {
      if (!user?.id) {
        setFormData({});
        if(isMounted) setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile && isMounted) {
          const { data: member } = await supabase.from('members').select('*').eq('profile_id', profile.id).single();
          setFormData({ ...profile, ...member });
        } else if (isMounted) {
            setFormData({ email: user.email }); // Preenche o email para o novo perfil
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, [user?.id]); // Dependência estável, só roda quando o usuário muda.

  // OTIMIZAÇÃO: Handlers memoizados com useCallback para não serem recriados a cada renderização.
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  }, []);
  
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  const handleFacialCaptureSuccess = useCallback((descriptor: number[]) => {
    setFormData((prev: any) => ({ ...prev, face_descriptor: descriptor }));
    setFacialModalOpen(false);
    alert('Rosto capturado! Clique em "Salvar" para confirmar.');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { full_name, email, password } = formData;

    if (!full_name || !email) {
      alert('Nome completo e email são obrigatórios.');
      return;
    }
    if (!user && !password) {
        alert('A senha é obrigatória para o cadastro.');
        return;
    }
    setLoading(true);

    try {
      let userId = user?.id;
      if (!user) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Cadastro falhou, usuário não criado.");
        userId = authData.user.id;
      }

      const profilePayload = {
        id: userId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        birth_date: formData.birth_date,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        face_descriptor: formData.face_descriptor,
      };
      
      const memberPayload = {
        profile_id: userId,
        marital_status: formData.marital_status,
        profession: formData.profession,
        conversion_date: formData.conversion_date,
        baptism_date: formData.baptism_date,
        origin_church: formData.origin_church,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
      };

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
      if (profileError) throw profileError;

      const { error: memberError } = await supabase.from('members').upsert(memberPayload, { onConflict: 'profile_id' });
      if (memberError) throw memberError;

      alert(user ? 'Perfil salvo com sucesso!' : 'Cadastro realizado com sucesso! Verifique seu email.');
      
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Carregando...</div>;

  return (
    <>
      {isFacialModalOpen && (
        <FacialCaptureModal onClose={() => setFacialModalOpen(false)} onCaptureSuccess={handleFacialCaptureSuccess} />
      )}
      
      <PageHeader title={user ? 'Meu Perfil' : 'Criar Nova Conta'} />
      
      <main>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-4 pb-24">
          <FormSection title="Informações Pessoais" icon={<User size={20}/>}>
            <div><Label>Nome Completo *</Label><Input name="full_name" value={formData.full_name || ''} onChange={handleChange} required /></div>
            <div><Label>Email *</Label><Input name="email" type="email" value={formData.email || ''} onChange={handleChange} disabled={!!user} required /></div>
            {!user && ( <div><Label>Senha *</Label><Input name="password" type="password" value={formData.password || ''} onChange={handleChange} required /></div> )}
            <div><Label>Telefone</Label><Input name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} /></div>
            <div><Label>Data de Nascimento</Label><Input name="birth_date" type="date" value={formData.birth_date || ''} onChange={handleChange} /></div>
            <div><Label>Estado Civil</Label>
              <Select value={formData.marital_status || ''} onValueChange={(v) => handleSelectChange('marital_status', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                <SelectContent><SelectItem value="single">Solteiro(a)</SelectItem><SelectItem value="married">Casado(a)</SelectItem><SelectItem value="divorced">Divorciado(a)</SelectItem><SelectItem value="widowed">Viúvo(a)</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Profissão</Label><Input name="profession" value={formData.profession || ''} onChange={handleChange} /></div>
          </FormSection>

          <FormSection title="Informações Eclesiásticas" icon={<Church size={20}/>}>
            <div><Label>Data de Conversão</Label><Input name="conversion_date" type="date" value={formData.conversion_date || ''} onChange={handleChange} /></div>
            <div><Label>Data do Batismo</Label><Input name="baptism_date" type="date" value={formData.baptism_date || ''} onChange={handleChange} /></div>
            <div><Label>Igreja de Origem</Label><Input name="origin_church" value={formData.origin_church || ''} onChange={handleChange} /></div>
          </FormSection>
          
          <FormSection title="Endereço" icon={<MapPin size={20}/>}>
            <div><Label>Endereço</Label><Input name="address" value={formData.address || ''} onChange={handleChange} /></div>
            <div><Label>Cidade</Label><Input name="city" value={formData.city || ''} onChange={handleChange} /></div>
            <div><Label>Estado</Label><Input name="state" value={formData.state || ''} onChange={handleChange} /></div>
            <div><Label>CEP</Label><Input name="zip_code" value={formData.zip_code || ''} onChange={handleChange} /></div>
          </FormSection>

          <FormSection title="Contato de Emergência" icon={<PhoneCall size={20}/>}>
            <div><Label>Nome</Label><Input name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleChange} /></div>
            <div><Label>Telefone</Label><Input name="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone || ''} onChange={handleChange} /></div>
          </FormSection>

          <FormSection title="Reconhecimento Facial" icon={<SmilePlus size={20}/>}>
            <div className="text-center">
              {formData?.face_descriptor ? (
                <div className="text-emerald-400 font-bold">
                  <p>✅ Rosto já cadastrado.</p>
                  <button type="button" onClick={() => setFacialModalOpen(true)} className="text-sm text-blue-400 mt-1 hover:underline">Cadastrar novamente</button>
                </div>
              ) : (
                <>
                  <p className="mb-3">Cadastre seu rosto para o check-in automático.</p>
                  <Button type="button" onClick={() => setFacialModalOpen(true)}>Iniciar Cadastro Facial</Button>
                </>
              )}
            </div>
          </FormSection>

          <Button type="submit" disabled={loading} className="w-full p-3 bg-emerald-600 rounded-lg font-bold text-lg disabled:bg-gray-500">
            {loading ? 'Salvando...' : (user ? 'Salvar Alterações' : 'Criar Conta')}
          </Button>
        </form>
      </main>
    </>
  );
};

export default ProfilePage;
