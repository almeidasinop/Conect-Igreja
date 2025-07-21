import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Church, MapPin, PhoneCall, SmilePlus, LogIn, ScanFace, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTES AUXILIARES ---

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

// Modal de Captura Facial (agora muito mais simples)
const FacialCaptureModal = ({ onClose, onCapture, title, buttonText }: { onClose: () => void, onCapture: (imageData: string) => void, title: string, buttonText: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Iniciando câmera...');

  useEffect(() => {
    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          setStatus('Posicione seu rosto e capture a foto.');
        })
        .catch(() => setStatus('Erro ao acessar a câmera.'));
    };
    startVideo();
    
    return () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Converte a imagem para base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(imageData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-emerald-500">
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <p className="text-white my-4 h-6">{status}</p>
        <div className="space-y-3">
          <Button onClick={handleCapture} className="w-full">{buttonText}</Button>
          <Button onClick={onClose} variant="secondary" className="w-full">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};


// --- FORMULÁRIO DE PERFIL/CADASTRO ---
const ProfileForm = ({ isRegister = false, onSwitchToLogin }: { isRegister?: boolean, onSwitchToLogin?: () => void }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isFacialModalOpen, setFacialModalOpen] = useState(false);
    const [profileData, setProfileData] = useState<any>({});
    const [memberData, setMemberData] = useState<any>({});
    const [password, setPassword] = useState('');
    const [faceImage, setFaceImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
          if (!user && !isRegister) return;
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
    }, [user, isRegister]);

    const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setProfileData((prev: any) => ({ ...prev, [e.target.name]: e.target.value })); }, []);
    const handleMemberChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setMemberData((prev: any) => ({ ...prev, [e.target.name]: e.target.value })); }, []);
    const handleSelectChange = useCallback((name: string, value: string) => { setMemberData((prev: any) => ({ ...prev, [name]: value })); }, []);

    const handleFacialCaptureSuccess = useCallback((imageData: string) => {
        setFaceImage(imageData);
        setFacialModalOpen(false);
        toast({ title: "Rosto Capturado!", description: "A imagem será enviada ao salvar." });
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (validações)
        setLoading(true);

        try {
            let userId = user?.id;
            let finalProfileData = { ...profileData };

            if (isRegister) {
                const { data: authData, error: signUpError } = await supabase.auth.signUp({ email: profileData.email, password });
                if (signUpError) throw signUpError;
                userId = authData.user!.id;
                finalProfileData.id = userId;
            }

            const { error: profileError } = await supabase.from('profiles').upsert(finalProfileData);
            if (profileError) throw profileError;

            // Se houver uma nova imagem facial, chama a função de nuvem para registrá-la
            if (faceImage && userId) {
                const { error: funcError } = await supabase.functions.invoke('add-face', {
                    body: { userId, imageBase64: faceImage.split(',')[1] } // Envia apenas os dados base64
                });
                if (funcError) throw funcError;
            }

            const memberPayload = { ...memberData, profile_id: userId };
            const { error: memberError } = await supabase.from('members').upsert(memberPayload, { onConflict: 'profile_id' });
            if (memberError) throw memberError;

            toast({ title: "Sucesso!", description: isRegister ? 'Cadastro realizado!' : 'Perfil salvo!' });
        } catch (error: any) {
            toast({ title: "Erro ao Salvar", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">Carregando...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... (Todos os FormSections como antes) ... */}
            <FormSection title="Reconhecimento Facial" icon={<SmilePlus size={20}/>}>
                <div className="text-center">
                  {profileData?.azure_person_id ? ( // Verifica se já tem um ID do Azure
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
                  {faceImage && <p className="text-sm text-yellow-400 mt-2">Nova foto pronta para ser salva.</p>}
                </div>
            </FormSection>
            <Button type="submit" disabled={loading} className="w-full p-3 bg-emerald-600 font-bold text-lg">
                {loading ? 'Salvando...' : (isRegister ? 'Criar Conta' : 'Salvar Alterações')}
            </Button>
            {isRegister && (
                 <p className="text-center text-sm text-neutral-400">
                    Já tem uma conta?{' '}
                    <button type="button" onClick={onSwitchToLogin} className="font-bold text-emerald-400 hover:underline">Faça o login</button>
                </p>
            )}
            {isFacialModalOpen && <FacialCaptureModal onClose={() => setFacialModalOpen(false)} onCapture={handleFacialCaptureSuccess} title="Cadastro Facial" buttonText="Capturar e Cadastrar" />}
        </form>
    );
};

// --- TELA DE LOGIN ---
const LoginPage = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFacialLoginOpen, setIsFacialLoginOpen] = useState(false);
    const [facialLoginStatus, setFacialLoginStatus] = useState('');
    const { toast } = useToast();
    const passwordInputRef = useRef<HTMLInputElement>(null);

    const handleLogin = async () => { /* ... (lógica de login normal) ... */ };

    const handleFacialLogin = async (imageData: string) => {
        setFacialLoginStatus('Reconhecendo...');
        try {
            const { data, error } = await supabase.functions.invoke('identify-face', {
                body: { imageBase64: imageData.split(',')[1] }
            });

            if (error) throw error;
            
            if (data.email) {
                setEmail(data.email);
                setIsFacialLoginOpen(false);
                toast({ title: "Rosto Reconhecido!", description: "Digite sua senha para continuar." });
                passwordInputRef.current?.focus();
            } else {
                setFacialLoginStatus('Rosto não encontrado.');
                toast({ title: "Falha", description: "Nenhum usuário encontrado com este rosto.", variant: "destructive" });
            }
        } catch (error: any) {
            setFacialLoginStatus('Erro no reconhecimento.');
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    return (
        <>
            {isFacialLoginOpen && (
                <FacialCaptureModal 
                    onClose={() => setIsFacialLoginOpen(false)}
                    onCapture={handleFacialLogin}
                    title="Login Facial"
                    buttonText="Reconhecer Rosto"
                />
            )}
            <div className="space-y-6">
                <FormSection title="Acessar Conta" icon={<LogIn size={20}/>}>
                    <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" /></div>
                    <div><Label>Senha</Label><Input ref={passwordInputRef} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
                </FormSection>
                <Button onClick={handleLogin} className="w-full p-3 bg-emerald-600 font-bold text-lg">Entrar</Button>
                <Button variant="outline" className="w-full" onClick={() => setIsFacialLoginOpen(true)}>
                    <ScanFace className="mr-2 h-5 w-5" />
                    Entrar com Rosto
                </Button>
                <p className="text-center text-sm text-neutral-400">
                    Não tem uma conta?{' '}
                    <button type="button" onClick={onSwitchToRegister} className="font-bold text-emerald-400 hover:underline">Cadastre-se</button>
                </p>
            </div>
        </>
    );
};

// --- COMPONENTE PRINCIPAL ---
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  if (user) {
    return (
        <div>
            <PageHeader title="Meu Perfil" />
            <div className="p-4 pb-24">
                <ProfileForm />
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 pb-24">
        <h1 className="text-3xl font-bold text-center mb-6">Bem-vindo!</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
                <LoginPage onSwitchToRegister={() => setActiveTab('register')} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
                <ProfileForm isRegister={true} onSwitchToLogin={() => setActiveTab('login')} />
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default ProfilePage;
