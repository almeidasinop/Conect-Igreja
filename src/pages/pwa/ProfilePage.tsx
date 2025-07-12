import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Church, MapPin, PhoneCall, SmilePlus } from 'lucide-react';

// Declara a variável global da face-api
declare const faceapi: any;

// Componente para a Câmera de Cadastro Facial (em um Modal)
const FacialCaptureModal = ({ onClose, onCaptureSuccess }: { onClose: () => void, onCaptureSuccess: (descriptor: number[]) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Posicione seu rosto no centro');

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => setStatus('Erro ao acessar a câmera.'));
    };
    startVideo();
  }, []);

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
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-emerald-500">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <p className="text-white my-4">{status}</p>
        <div className="space-y-3">
          <button onClick={handleCapture} className="w-full py-3 bg-emerald-500 rounded-full font-bold">Capturar Rosto</button>
          <button onClick={onClose} className="w-full py-3 bg-gray-600 rounded-full font-bold">Cancelar</button>
        </div>
      </div>
    </div>
  );
};


// Componente Principal da Página de Perfil
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isFacialModalOpen, setFacialModalOpen] = useState(false);
  
  // Estados separados para cada tabela, como no painel
  const [profileData, setProfileData] = useState<any>({});
  const [memberData, setMemberData] = useState<any>({});

  // Carrega os dados do perfil e do membro
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Busca o perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', profileError);
    }
    setProfileData(profile || { id: user.id, email: user.email });

    // 2. Se o perfil existir, busca os dados de membro associados
    if (profile) {
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      
      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Erro ao buscar dados de membro:', memberError);
      }
      setMemberData(member || {});
    }
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberData({ ...memberData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setMemberData({ ...memberData, [name]: value });
  };
  
  const handleFacialCaptureSuccess = (descriptor: number[]) => {
    setProfileData({ ...profileData, face_descriptor: descriptor });
    setFacialModalOpen(false);
    alert('Rosto capturado! Clique em "Salvar Alterações" para confirmar.');
  };

  // Salva todas as alterações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.full_name) {
      alert('O nome completo é obrigatório.');
      return;
    }
    setLoading(true);

    try {
      // 1. Salva (cria ou atualiza) os dados em 'profiles'
      const { data: savedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Salva (cria ou atualiza) os dados em 'members'
      const memberPayload = {
        ...memberData,
        profile_id: savedProfile.id, // Garante a associação correta
      };
      
      const { error: memberError } = await supabase
        .from('members')
        .upsert(memberPayload, { onConflict: 'profile_id' }); // Usa profile_id como chave de conflito

      if (memberError) throw memberError;

      alert('Perfil salvo com sucesso!');
      fetchUserData(); // Recarrega os dados para garantir consistência
    } catch (error: any) {
      alert('Erro ao salvar o perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-white bg-gray-900 min-h-screen">Carregando perfil...</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 pb-20">
      {isFacialModalOpen && (
        <FacialCaptureModal
          onClose={() => setFacialModalOpen(false)}
          onCaptureSuccess={handleFacialCaptureSuccess}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center">Meu Perfil</h1>
        
        {/* Card: Informações Pessoais */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><User /> Informações Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nome Completo *</Label><Input name="full_name" value={profileData.full_name || ''} onChange={handleProfileChange} required /></div>
            <div><Label>Email</Label><Input name="email" type="email" value={profileData.email || ''} disabled className="text-gray-400" /></div>
            <div><Label>Telefone</Label><Input name="phone" type="tel" value={profileData.phone || ''} onChange={handleProfileChange} /></div>
            <div><Label>Data de Nascimento</Label><Input name="birth_date" type="date" value={profileData.birth_date || ''} onChange={handleProfileChange} /></div>
            <div><Label>Estado Civil</Label>
              <Select value={memberData.marital_status || ''} onValueChange={(v) => handleSelectChange('marital_status', v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                <SelectContent><SelectItem value="single">Solteiro(a)</SelectItem><SelectItem value="married">Casado(a)</SelectItem><SelectItem value="divorced">Divorciado(a)</SelectItem><SelectItem value="widowed">Viúvo(a)</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Profissão</Label><Input name="profession" value={memberData.profession || ''} onChange={handleMemberChange} /></div>
          </CardContent>
        </Card>

        {/* Card: Informações Eclesiásticas */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><Church /> Informações Eclesiásticas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Data de Conversão</Label><Input name="conversion_date" type="date" value={memberData.conversion_date || ''} onChange={handleMemberChange} /></div>
            <div><Label>Data do Batismo</Label><Input name="baptism_date" type="date" value={memberData.baptism_date || ''} onChange={handleMemberChange} /></div>
            <div><Label>Igreja de Origem</Label><Input name="origin_church" value={memberData.origin_church || ''} onChange={handleMemberChange} /></div>
          </CardContent>
        </Card>
        
        {/* Card: Endereço */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Endereço</Label><Input name="address" value={profileData.address || ''} onChange={handleProfileChange} /></div>
            <div><Label>Cidade</Label><Input name="city" value={profileData.city || ''} onChange={handleProfileChange} /></div>
            <div><Label>Estado</Label><Input name="state" value={profileData.state || ''} onChange={handleProfileChange} /></div>
            <div><Label>CEP</Label><Input name="zip_code" value={profileData.zip_code || ''} onChange={handleProfileChange} /></div>
          </CardContent>
        </Card>

        {/* Card: Contato de Emergência */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><PhoneCall /> Contato de Emergência</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nome</Label><Input name="emergency_contact_name" value={memberData.emergency_contact_name || ''} onChange={handleMemberChange} /></div>
            <div><Label>Telefone</Label><Input name="emergency_contact_phone" type="tel" value={memberData.emergency_contact_phone || ''} onChange={handleMemberChange} /></div>
          </CardContent>
        </Card>

        {/* Card: Cadastro Facial */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader><CardTitle className="flex items-center gap-2"><SmilePlus /> Reconhecimento Facial</CardTitle></CardHeader>
          <CardContent className="text-center">
            {profileData?.face_descriptor ? (
              <div className="text-emerald-400 font-bold">
                <p>✅ Rosto já cadastrado.</p>
                <button type="button" onClick={() => setFacialModalOpen(true)} className="text-sm text-blue-400 mt-1 hover:underline">Cadastrar novamente</button>
              </div>
            ) : (
              <>
                <p className="mb-3">Cadastre seu rosto para fazer o check-in automático no totem da igreja.</p>
                <Button type="button" onClick={() => setFacialModalOpen(true)}>Iniciar Cadastro Facial</Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Botão de Salvar Fixo */}
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
            <Button type="submit" disabled={loading} className="w-full max-w-lg mx-auto p-3 bg-emerald-600 rounded-lg font-bold text-lg disabled:bg-gray-500">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
