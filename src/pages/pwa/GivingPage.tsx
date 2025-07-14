import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Copy, QrCode, ArrowUpRight } from 'lucide-react';

// Componente de Cabeçalho Padrão
const PageHeader = ({ title }: { title: string }) => (
  <header className="sticky top-0 bg-black z-10 p-4 text-center border-b border-neutral-800">
    <h1 className="text-xl font-bold">{title}</h1>
  </header>
);

// Componente Principal da Página
const GivingPage: React.FC = () => {
  const { toast } = useToast();
  const pixKey = "07.154.931/0001-93";
  // Conteúdo do botão "Copia e Cola" atualizado
  const pixQRCodeLink = "00020126360014BR.GOV.BCB.PIX0114071549310001935204000053039865802BR5923Igreja Ministerio da Fe6005Sinop62070503***63045486";

  const handleCopyKey = (keyToCopy: string, message: string) => {
    navigator.clipboard.writeText(keyToCopy).then(() => {
      toast({
        title: message,
        description: "Você já pode colar no seu aplicativo do banco.",
      });
    }).catch(err => {
      console.error('Falha ao copiar: ', err);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <PageHeader title="Envolva-se" />
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-bold">Dízimos e Ofertas</h2>
          <p className="text-neutral-400 mt-2">
            Sua contribuição generosa nos ajuda a continuar espalhando a Palavra de Deus.
          </p>

          <Card className="bg-neutral-900 border-neutral-800 mt-8 text-left">
            <CardHeader>
              <CardTitle>PIX (Chave CNPJ)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
                <span className="font-mono text-lg">{pixKey}</span>
                <Button variant="ghost" size="icon" onClick={() => handleCopyKey(pixKey, "Chave PIX copiada!")}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-sm text-neutral-400 mt-3">
                <p><span className="font-semibold text-neutral-200">Tipo da Chave:</span> CNPJ</p>
                <p><span className="font-semibold text-neutral-200">Favorecido:</span> Igreja Ministério da Fé</p>
              </div>
            </CardContent>
          </Card>

           <div className="mt-6">
             <Button onClick={() => handleCopyKey(pixQRCodeLink, "Pix Copia e Cola copiado!")} className="w-full p-6 bg-emerald-600 rounded-lg font-bold text-lg hover:bg-emerald-700">
                <span className="flex items-center justify-center gap-2">
                    <Copy className="h-5 w-5" />
                    Copiar Código Pix (Copia e Cola)
                </span>
             </Button>
           </div>
           
          <Card className="bg-neutral-900 border-neutral-800 mt-6 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode />
                PIX (QR Code)
              </CardTitle>
              <CardDescription>
                Se preferir, abra o app do seu banco e escaneie o código abaixo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                {/* Imagem do QR Code atualizada */}
                <img src="/icons/Qp_PIX.svg" alt="QR Code para doação PIX" className="w-56 h-56" />
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default GivingPage;
