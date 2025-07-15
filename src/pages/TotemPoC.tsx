import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

// Declara a variável global da face-api, já que a carregamos via tag <script>
declare const faceapi: any;

// Interface para os dados do perfil que vamos buscar
interface ProfileWithDescriptor {
    full_name: string;
    face_descriptor: number[] | string; // Pode vir como string do DB
}

const TotemPoC: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
    const [status, setStatus] = useState('Iniciando totem...');
    const [isLoading, setIsLoading] = useState(true);
    
    // --- ESTADOS ATUALIZADOS PARA MÚLTIPLAS PESSOAS ---
    const [recognizedPeople, setRecognizedPeople] = useState<string[]>([]);
    const [isCheckinProcessActive, setIsCheckinProcessActive] = useState(false);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [showFlash, setShowFlash] = useState(false);

    // 1. Carrega os modelos de IA e os perfis faciais do Supabase
    useEffect(() => {
        const setupTotem = async () => {
            if (typeof faceapi === 'undefined') {
                setStatus('Erro: Biblioteca de IA não carregada.');
                setIsLoading(false);
                return;
            }
            setStatus('Carregando modelos de IA...');
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
            
            setStatus('Carregando perfis faciais...');
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, face_descriptor')
                .not('face_descriptor', 'is', null);

            if (error) {
                console.error("Erro ao buscar perfis:", error);
                setStatus(`Erro: ${error.message}`);
                setIsLoading(false);
                return;
            }

            if (data && data.length > 0) {
                const labeledFaceDescriptors = data.map(
                    (profile: ProfileWithDescriptor) => {
                        try {
                            const descriptorArray = typeof profile.face_descriptor === 'string'
                                ? JSON.parse(profile.face_descriptor)
                                : profile.face_descriptor;
                            
                            if (!Array.isArray(descriptorArray) || descriptorArray.length !== 128) {
                                return null;
                            }

                            return new faceapi.LabeledFaceDescriptors(
                                profile.full_name,
                                [Float32Array.from(descriptorArray)]
                            );
                        } catch (e) {
                            return null;
                        }
                    }
                ).filter(ld => ld !== null) as faceapi.LabeledFaceDescriptors[];

                if (labeledFaceDescriptors.length > 0) {
                    const matcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);
                    setFaceMatcher(matcher);
                    setStatus('Posicione-se em frente à câmera.');
                } else {
                    setStatus('Nenhum perfil facial válido encontrado.');
                }

            } else {
                setStatus('Nenhum perfil facial cadastrado.');
            }
            setIsLoading(false);
        };
        setupTotem();
    }, []);

    // 2. Inicia a câmera quando os modelos estiverem prontos
    useEffect(() => {
        if (modelsLoaded && !isLoading) {
            navigator.mediaDevices
                .getUserMedia({ video: {} })
                .then((stream) => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch((err) => {
                    console.error("Erro ao acessar a webcam:", err);
                    setStatus('Erro na câmera.');
                });
        }
    }, [modelsLoaded, isLoading]);

    // 3. Lógica da contagem decrescente e da foto para o GRUPO
    useEffect(() => {
        if (isCheckinProcessActive) {
            const peopleToCheckIn = [...recognizedPeople];
            
            setTimeout(() => {
                let count = 3;
                setStatus(`Preparem-se para a foto...`);
                setCountdown(count);

                const timer = setInterval(() => {
                    count -= 1;
                    setCountdown(count);
                    if (count === 0) {
                        clearInterval(timer);
                        setShowFlash(true);
                        setStatus(`Check-in de ${peopleToCheckIn.join(', ')} realizado!`);
                        
                        setTimeout(() => {
                            setShowFlash(false);
                            setTimeout(() => {
                                setRecognizedPeople([]);
                                setIsCheckinProcessActive(false);
                                setCountdown(null);
                                setStatus('Posicione-se em frente à câmera.');
                            }, 4000);
                        }, 200);
                    }
                }, 1000);
            }, 2000);
        }
    }, [isCheckinProcessActive, recognizedPeople]);

    // 4. Loop principal de reconhecimento facial para MÚLTIPLAS pessoas
    const handleVideoOnPlay = () => {
        const video = videoRef.current;
        if (!video) return;

        const recognitionInterval = setInterval(async () => {
            if (isCheckinProcessActive || !faceMatcher || (videoRef.current && videoRef.current.paused)) {
                return;
            }

            const canvas = canvasRef.current;
            if (canvas) {
                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                faceapi.matchDimensions(canvas, displaySize);

                const detections = await faceapi
                    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptors();
                
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

                if (resizedDetections.length > 0) {
                    const matches = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
                    const uniqueNames = [...new Set(matches.map(m => m.label).filter(l => l !== 'unknown'))];

                    // Desenha as caixas e nomes na tela
                    matches.forEach((result, i) => {
                        const box = resizedDetections[i].detection.box;
                        
                        // CORREÇÃO: Inverte manualmente a coordenada X da caixa para alinhar com o vídeo espelhado.
                        const flippedBox = { 
                            ...box, 
                            x: canvas.width - box.x - box.width 
                        };
                        
                        const drawBox = new faceapi.draw.DrawBox(flippedBox, { label: result.toString() });
                        drawBox.draw(canvas);
                    });

                    if (uniqueNames.length > 0) {
                        setRecognizedPeople(uniqueNames);
                        setStatus(`Olá, ${uniqueNames.join(', ')}!`);
                        setIsCheckinProcessActive(true);
                    }
                }
            }
        }, 2000); // Intervalo um pouco maior para processar múltiplos rostos

        return () => clearInterval(recognitionInterval);
    };

    const welcomeMessage = recognizedPeople.length > 0 
        ? `Olá, ${recognizedPeople.join(', ')}!`
        : 'Bem-vindo!';

    return (
        <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                muted
                onPlay={handleVideoOnPlay}
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
            />
            {/* CORREÇÃO: O canvas não é mais espelhado via CSS. A inversão é feita no código. */}
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
            
            {showFlash && <div className="absolute inset-0 bg-white z-30 animate-ping opacity-75"></div>}

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/70 to-transparent z-20">
                <div className="bg-black/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto text-center">
                    {countdown !== null ? (
                        <div className="flex flex-col items-center">
                            <h1 className="text-8xl md:text-9xl font-bold text-emerald-400" style={{ textShadow: '0 0 15px rgba(52, 211, 153, 0.7)' }}>
                                {countdown > 0 ? countdown : '📸'}
                            </h1>
                            <p className="text-xl md:text-2xl font-semibold mt-4">{status}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <h1 className="text-4xl md:text-5xl font-bold">{welcomeMessage}</h1>
                            <p className="text-xl md:text-2xl mt-4 text-neutral-300">{status}</p>
                            {isLoading && <Loader className="mt-4 animate-spin h-8 w-8" />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TotemPoC;
