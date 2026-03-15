import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Loader2, LogOut, Music } from "lucide-react";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("jingle_api_key") || "");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [segment, setSegment] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("jingle_api_key", apiKey);
  }, [apiKey]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      toast.error("Por favor, insira sua Chave API do Google AI Studio");
      return;
    }

    if (!storeName.trim()) {
      toast.error("Por favor, insira o nome da loja");
      return;
    }

    setIsLoading(true);
    setOutput("⏳ Gerando jingle...");

    try {
      const systemPrompt = `Você é um compositor especialista em jingles publicitários. Crie letras formatadas exclusivamente para a inteligência artificial Suno AI. Baseado nos dados fornecidos do cliente, você deve entregar duas criações e nada mais. Não converse comigo, apenas entregue no seguinte formato exato:

🔥 JINGLE CURTO (30 Segundos) 🔥
Estilo Musical: [Traduza e aprimore o 'Gênero Musical Desejado' fornecido pelo usuário para um prompt em inglês perfeito para o Suno AI, adicionando termos como 'commercial', 'promotional', 'upbeat' se necessário]

Letra:
[Escreva uma letra curta de 4 a 6 linhas, focada em impacto rápido, citando a loja e a promoção/telefone]

--------------------------------------------------
🎵 MÚSICA COMPLETA (1 a 2 Minutos) 🎵
Estilo Musical: [Traduza e aprimore o 'Gênero Musical Desejado' para um prompt em inglês perfeito para o Suno AI]

Letra:
[Escreva a música completa OBRIGATORIAMENTE usando as tags do Suno: [Intro], [Verse], [Chorus], [Bridge], [Outro]. O refrão deve ser chiclete e repetir o nome da loja. Incorpore pedidos específicos (como partes faladas com a tag [Spoken Word]) se houver na descrição. A letra deve se encaixar perfeitamente no gênero musical escolhido.]`;

      const userData = `DADOS DO CLIENTE:
- Loja: ${storeName}
- Telefone: ${phone}
- Endereço: ${address}
- Segmento: ${segment}
- Gênero Musical: ${genre}
- Detalhes Extras: ${description}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\n${userData}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error("Limite de requisições atingido. Tente novamente em alguns minutos.");
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Chave API inválida ou expirada. Verifique sua chave.");
        } else {
          throw new Error(errorData.error?.message || `Erro ${response.status}`);
        }
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("Nenhum conteúdo foi gerado. Tente novamente.");
      }

      setOutput(generatedText);
      toast.success("Jingle gerado com sucesso!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setOutput(`❌ Erro: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (output && !output.includes("❌")) {
      navigator.clipboard.writeText(output);
      toast.success("Texto copiado para a área de transferência!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jingle_auth");
    localStorage.removeItem("jingle_email");
    onLogout();
    toast.success("Desconectado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Gerador de Jingles</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-foreground mb-6">Configurações do Jingle</h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* API Key */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Chave API do Google AI Studio
                  </label>
                  <Input
                    type="password"
                    placeholder="Sua chave API"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Salvo localmente no seu dispositivo
                  </p>
                </div>

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nome da Loja
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Academia Fit"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Endereço
                  </label>
                  <Input
                    type="text"
                    placeholder="Rua Principal, 123"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Segment */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Segmento/Ramo
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Academia, Padaria, Restaurante"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Gênero Musical Desejado
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Pop, Sertanejo, Funk"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descrição, Promoções e Detalhes Especiais
                  </label>
                  <Textarea
                    placeholder="Descreva a promoção, ofertas especiais ou qualquer detalhe importante..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    className="min-h-24 bg-input border-border resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg transition-all duration-200 mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 mr-2" />
                      Gerar Jingle com IA
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Painel de Entrega</h2>
                {output && !output.includes("❌") && (
                  <Button
                    onClick={handleCopyOutput}
                    size="sm"
                    variant="outline"
                    className="border-border hover:bg-input"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                )}
              </div>

              <div
                ref={outputRef}
                className="flex-1 bg-input border border-border rounded-lg p-4 overflow-y-auto text-sm text-foreground whitespace-pre-wrap font-mono"
              >
                {output || (
                  <span className="text-muted-foreground">
                    Seu jingle gerado aparecerá aqui...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
