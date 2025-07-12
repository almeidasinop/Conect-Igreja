import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client'; // Importa o cliente Supabase
import { useAuth } from '../../contexts/AuthContext'; // Importa o contexto de autenticação

// Declara a variável global da face-api
declare const faceapi: any;

const FacialRegistration: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth(); // Obtém o usuário logado

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState('Aguardando a biblioteca de IA...');
  const [captureStep, setCaptureStep] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle');

  // Carrega os modelos da face-api
  useEffect(() => {
    const loadModels = async () => {
      if (typeof faceapi === 'undefined') {
        setStatus('Erro: A biblioteca face-api.js não foi encontrada.');
        return;
      }
      setStatus('Carregando modelos de IA...');
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('Tudo pronto! Posicione seu rosto.');
      } catch (error) {
        setStatus('Falha ao carregar os modelos.');
        console.error(error);
      }
    };
    loadModels();
  }, []);

  // Inicia a câmera quando os modelos estiverem prontos
  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setStatus('Não foi possível acessar a câmera.');
      });
  };

  // Lógica de detecção contínua para desenhar no canvas
  const handleVideoOnPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      if (!videoRef.current) {
        clearInterval(interval);
        return;
      }
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }, 200);

    return () => clearInterval(interval);
  };

  // Função principal para capturar e salvar o descritor facial
  const handleCaptureAndRegister = async () => {
    if (!videoRef.current || !user) {
      setStatus('Usuário não autenticado ou câmera não pronta.');
      return;
    }
    setCaptureStep('capturing');
    setStatus('Analisando seu rosto...');

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setCaptureStep('error');
      setStatus('Nenhum rosto detectado. Tente novamente.');
      return;
    }

    // O descritor facial é um array de 128 números.
    const faceDescriptor = Array.from(detection.descriptor);
    console.log('Descritor Facial Gerado:', faceDescriptor);
    
    // **AQUI ACONTECE A MÁGICA: SALVANDO NO SUPABASE**
    // Precisamos de uma coluna 'face_descriptor' (vector) na tabela 'profiles' ou 'members'
    const { error } = await supabase
      .from('profiles') // Assumindo que a tabela de usuários se chama 'profiles'
      .update({ face_descriptor: faceDescriptor })
      .eq('id', user.id);

    if (error) {
      setCaptureStep('error');
      setStatus('Erro ao salvar no banco de dados.');
      console.error('Erro do Supabase:', error);
    } else {
      setCaptureStep('success');
      setStatus('Pronto! Seu rosto foi cadastrado com sucesso.');
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Camada de Vídeo e Canvas */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoOnPlay}
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      {/* Overlay com a interface */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full w-full p-6 text-white bg-black bg-opacity-40">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Cadastro Facial</h1>
          <p className="text-lg mt-2">{status}</p>
        </div>

        {/* Área de Captura (um círculo para guiar o usuário) */}
        <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-full flex items-center justify-center">
          {captureStep === 'success' && <span className="text-6xl">✅</span>}
        </div>

        {/* Footer com o botão de ação */}
        <div className="w-full">
          {captureStep !== 'success' ? (
            <button
              onClick={handleCaptureAndRegister}
              disabled={!modelsLoaded || captureStep === 'capturing'}
              className="w-full py-4 bg-emerald-500 rounded-full text-xl font-bold disabled:bg-gray-500"
            >
              {captureStep === 'capturing' ? 'Processando...' : 'Capturar e Cadastrar'}
            </button>
          ) : (
             <p className="text-center text-xl">Você já pode fechar esta tela.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacialRegistration;
