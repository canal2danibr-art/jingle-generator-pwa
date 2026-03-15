import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

interface LoginProps {
  onAuthSuccess: () => void;
}

const VALIDATION_URL = "https://script.google.com/macros/s/AKfycbxw1EVuoJLZHZlJHTAaoPvlRXUviSxOEuMBSO7XibzprSqDJ4dbgRbGP4Cs4YqfIGhx/exec";

export default function Login({ onAuthSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Por favor, digite seu e-mail");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${VALIDATION_URL}?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const isAuthorized = text.includes("AUTHORIZED") || text.includes("TRUE");

      if (isAuthorized) {
        localStorage.setItem("jingle_auth", "true");
        localStorage.setItem("jingle_email", email);
        toast.success("Login realizado com sucesso!");
        onAuthSuccess();
      } else {
        toast.error("E-mail não autorizado ou assinatura expirada");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao validar e-mail. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-card px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerador de Jingles</h1>
          <p className="text-muted-foreground text-sm">Crie jingles profissionais com IA</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                E-mail de Aluno
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12 bg-input border-border focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Digite o e-mail registrado para acessar a plataforma
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer info */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Não tem acesso? Fale com seu instrutor para ser autorizado.
            </p>
          </div>
        </div>

        {/* Security note */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Sua chave API será salva localmente no seu dispositivo
        </p>
      </div>
    </div>
  );
}
