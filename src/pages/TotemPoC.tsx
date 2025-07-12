import React, { useRef, useEffect, useState } from 'react';

// Como estamos carregando a face-api.js via tag <script> no index.html,
// ela se torna uma variável global. Precisamos declarar isso para o TypeScript
// não reclamar que a variável 'faceapi' não existe.
declare const faceapi: any;

const TotemPoC: React.FC = () => {
  // Referências para os elementos de vídeo e canvas
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estado para controlar se os modelos de IA foram carregados
  const [modelsLoaded, setModelsLoaded] = useState(false);
  // Estado para armazenar mensagens de status ou erros
  const [status, setStatus] = useState('Aguardando a biblioteca de IA carregar...');
  // Estado para armazenar os rostos que vamos cadastrar
  const [registeredFaces, setRegisteredFaces] = useState<any[]>([]);
  // Ref para manter a lista de rostos atualizada para o loop do setInterval
  const registeredFacesRef = useRef(registeredFaces);
  // Estado para o nome do usuário a ser cadastrado
  const [userName, setUserName] = useState('');

  // Mantém a ref sincronizada com o estado
  useEffect(() => {
    registeredFacesRef.current = registeredFaces;
  }, [registeredFaces]);

  // Este useEffect roda uma vez para carregar os modelos
  useEffect(() => {
    const loadModels = async () => {
      if (typeof faceapi === 'undefined') {
        setStatus('Erro: A biblioteca face-api.js não foi encontrada.');
        return;
      }

      setStatus('Biblioteca de IA carregada. Baixando modelos...');
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setStatus('Modelos carregados. Iniciando a câmera...');
      } catch (error) {
        console.error('Erro ao carregar os modelos de IA:', error);
        setStatus('Falha ao carregar os modelos. Verifique o console.');
      }
    };
    loadModels();
  }, []);

  // Este useEffect roda após os modelos serem carregados para iniciar a câmera
  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  // Função para iniciar a webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } }) // Usa a câmera frontal por padrão
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('Bem-vindo! Digite seu nome para se cadastrar.');
        }
      })
      .catch((err) => {
        console.error('Erro ao acessar a webcam:', err);
        setStatus('Não foi possível acessar a câmera. Verifique as permissões.');
      });
  };

  // Função para cadastrar um novo rosto
  const handleRegisterFace = async () => {
    if (!videoRef.current || !userName) {
      setStatus('Por favor, digite um nome para cadastrar.');
      return;
    }
    setStatus(`Analisando o rosto de ${userName}...`);
    
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const newRegisteredFace = new faceapi.LabeledFaceDescriptors(userName, [detection.descriptor]);
      setRegisteredFaces(prev => [...prev, newRegisteredFace]);
      setStatus(`Olá, ${userName}! Seu rosto foi cadastrado com sucesso!`);
      console.log('Descritor facial salvo:', detection.descriptor);
      setUserName('');
    } else {
      setStatus('Nenhum rosto detectado. Tente novamente.');
    }
  };

  // Função que é chamada quando o vídeo começa a tocar
  const handleVideoOnPlay = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const interval = setInterval(async () => {
        if (!videoRef.current) {
          clearInterval(interval);
          return;
        }
        
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

        if (registeredFacesRef.current.length > 0 && resizedDetections.length > 0) {
          const faceMatcher = new faceapi.FaceMatcher(registeredFacesRef.current, 0.6);
          const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
          
          results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const label = result.label === 'unknown'
              ? 'Desconhecido'
              : `Olá, ${result.label}! (${Math.round((1 - result.distance) * 100)}%)`;
            const drawBox = new faceapi.draw.DrawBox(box, { label: label, boxColor: 'rgba(16, 185, 129, 1)' });
            drawBox.draw(canvas);
          });
        }
        
      }, 200); // Aumentei o intervalo para economizar processamento

      return () => clearInterval(interval);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Mensagem de Status no Topo */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-black bg-opacity-50 text-center text-white z-20">
        <p className="text-lg">{status}</p>
      </div>

      {/* Vídeo e Canvas */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoOnPlay}
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      {/* Controles na Parte Inferior */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <div className="flex flex-col items-center space-y-4">
          <input 
            type="text" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome aqui"
            className="w-full max-w-sm px-5 py-3 rounded-full bg-white/20 text-white text-center text-xl placeholder-white/70 border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button 
            onClick={handleRegisterFace}
            disabled={!userName}
            className="w-full max-w-sm px-6 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white text-xl font-bold transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Cadastrar Rosto
          </button>
        </div>
      </div>
    </div>
  );
};

export default TotemPoC;
