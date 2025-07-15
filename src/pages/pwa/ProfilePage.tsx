import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Church, MapPin, PhoneCall, SmilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Declara a variável global da face-api
declare const faceapi: any;

// Componente para a Câmera de Cadastro Facial (em um Modal)
const FacialCaptureModal = ({ onClose, onCaptureSuccess }: { onClose: () => void, onCaptureSuccess: (descriptor: number[]) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Iniciando câmera...');
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
    }, 400);

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
          <canvas ref={canvasRef} className="absolute top-0 left-0" style={{ transform: 'scaleX(-1)' }}/>
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

const PageHeader = ({ title }: { title: string }) => (
  <header className="sticky top-0 bg-black z-10 p-4 text-center border-b border-neutral-800">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

const FormSection = React.memo(({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><span className="text-emerald-400">{icon}</span>{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
));

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isFacialModalOpen, setFacialModalOpen] = useState(false);
  
  // CORREÇÃO: Estados separados para cada tabela para evitar problemas de atualização.
  const [profileData, setProfileData] = useState<any>({});
  const [memberData, setMemberData] = useState<any>({});
  const [password, setPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          const { data: member } = await supabase.from('members').select('*').eq('profile_id', profile.id).single();
          setProfileData(profile);
          setMemberData(member || {});
        } else {
          setProfileData({ email: user.email });
          setMemberData({});
        }
      } else {
        setProfileData({});
        setMemberData({});
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleMemberChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    setMemberData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);
  
  const handleSelectChange = useCallback((name: string, value: string) => {
    setMemberData((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  const handleFacialCaptureSuccess = useCallback((descriptor: number[]) => {
    setProfileData((prev: any) => ({ ...prev, face_descriptor: descriptor }));
    setFacialModalOpen(false);
    toast({
      title: "Rosto Capturado!",
      description: "Não se esqueça de salvar as alterações para confirmar.",
    });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.full_name || !profileData.email) {
      toast({ title: "Campos Obrigatórios", description: "Nome completo e email são necessários.", variant: "destructive" });
      return;
    }
    if (!user && !password) {
      toast({ title: "Campo Obrigatório", description: "A senha é necessária para criar uma nova conta.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let userId = user?.id;
      let finalProfileData = { ...profileData };

      if (!user) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: profileData.email, password });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Cadastro falhou, usuário não criado.");
        userId = authData.user.id;
        finalProfileData.id = userId; // Adiciona o ID ao payload do perfil
      }

      const { error: profileError } = await supabase.from('profiles').upsert(finalProfileData);
      if (profileError) throw profileError;

      const memberPayload = { ...memberData, profile_id: userId };
      const { error: memberError } = await supabase.from('members').upsert(memberPayload, { onConflict: 'profile_id' });
      if (memberError) throw memberError;

      toast({
        title: "Sucesso!",
        description: user ? 'Seu perfil foi salvo com sucesso.' : 'Cadastro realizado com sucesso! Verifique seu email.',
      });
      
    } catch (error: any) {
      toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
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
            <div><Label>Nome Completo *</Label><Input name="full_name" value={profileData.full_name || ''} onChange={handleProfileChange} required /></div>
            <div><Label>Email *</Label><Input name="email" type="email" value={profileData.email || ''} onChange={handleProfileChange} disabled={!!user} required /></div>
            {!user && ( <div><Label>Senha *</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div> )}
            <div><Label>Telefone</Label><Input name="phone" type="tel" value={profileData.phone || ''} onChange={handleProfileChange} /></div>
            <div><Label>Data de Nascimento</Label><Input name="birth_date" type="date" value={profileData.birth_date || ''} onChange={handleProfileChange} /></div>
            <div><Label>Estado Civil</Label>
              <Select value={memberData.marital_status || ''} onValueChange={(v) => handleSelectChange('marital_status', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                <SelectContent><SelectItem value="single">Solteiro(a)</SelectItem><SelectItem value="married">Casado(a)</SelectItem><SelectItem value="divorced">Divorciado(a)</SelectItem><SelectItem value="widowed">Viúvo(a)</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Profissão</Label><Input name="profession" value={memberData.profession || ''} onChange={handleMemberChange} /></div>
          </FormSection>

          <FormSection title="Informações Eclesiásticas" icon={<Church size={20}/>}>
            <div><Label>Data de Conversão</Label><Input name="conversion_date" type="date" value={memberData.conversion_date || ''} onChange={handleMemberChange} /></div>
            <div><Label>Data do Batismo</Label><Input name="baptism_date" type="date" value={memberData.baptism_date || ''} onChange={handleMemberChange} /></div>
            <div><Label>Igreja de Origem</Label><Input name="origin_church" value={memberData.origin_church || ''} onChange={handleMemberChange} /></div>
          </FormSection>
          
          <FormSection title="Endereço" icon={<MapPin size={20}/>}>
            <div><Label>Endereço</Label><Input name="address" value={profileData.address || ''} onChange={handleProfileChange} /></div>
            <div><Label>Cidade</Label><Input name="city" value={profileData.city || ''} onChange={handleProfileChange} /></div>
            <div><Label>Estado</Label><Input name="state" value={profileData.state || ''} onChange={handleProfileChange} /></div>
            <div><Label>CEP</Label><Input name="zip_code" value={profileData.zip_code || ''} onChange={handleProfileChange} /></div>
          </FormSection>

          <FormSection title="Contato de Emergência" icon={<PhoneCall size={20}/>}>
            <div><Label>Nome</Label><Input name="emergency_contact_name" value={memberData.emergency_contact_name || ''} onChange={handleMemberChange} /></div>
            <div><Label>Telefone</Label><Input name="emergency_contact_phone" type="tel" value={memberData.emergency_contact_phone || ''} onChange={handleMemberChange} /></div>
          </FormSection>

          <FormSection title="Reconhecimento Facial" icon={<SmilePlus size={20}/>}>
            <div className="text-center">
              {profileData?.face_descriptor ? (
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
