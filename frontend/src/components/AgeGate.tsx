import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/logo.png";

const STORAGE_KEY = "age-gate-verified";

export const AgeGate = () => {
  const [visible, setVisible] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    try {
      const verified = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true";
      if (!verified) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  const handleExit = () => {
    if (typeof window !== "undefined") {
      window.location.href = "https://www.google.com";
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div
        className="mx-4 w-full max-w-lg rounded-xl border p-6 shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #2E0F12 0%, #1A0A0B 100%)",
          borderColor: "#5C1F24",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex justify-center mb-4">
          <img src={logoUrl} alt="Logo" className="h-12 w-auto opacity-95" />
        </div>
        {!declined ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Você tem 18 anos ou mais?</h2>
            <p className="text-sm text-[#F3E9E8]/80">
              Este site comercializa bebidas alcoólicas. Ao continuar, você confirma que é maior de 18 anos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAccept}
                size="lg"
                className="flex-1 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,38,48,0.45)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#8B3A41]/60"
                style={{ backgroundColor: "#7A2630", color: "#fff" }}
              >
                Tenho 18 anos
              </Button>
              <Button
                onClick={handleDecline}
                size="lg"
                className="flex-1 border border-[#8B3A41] text-[#F3E9E8] bg-transparent transition-all duration-200 hover:bg-white/10 hover:text-[#F3E9E8] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#8B3A41]/40"
                variant="ghost"
              >
                Não tenho
              </Button>
            </div>
            <p className="text-[11px] leading-relaxed text-[#F3E9E8]/70">
              Beba com moderação. A venda de bebidas alcoólicas é proibida para menores de 18 anos (Lei nº 13.106/2015).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Acesso restrito</h2>
            <p className="text-sm text-[#F3E9E8]/80">
              O acesso é permitido somente para maiores de 18 anos. Você será redirecionado.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleExit} size="lg" className="flex-1 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(122,38,48,0.45)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#8B3A41]/60" style={{ backgroundColor: "#7A2630", color: "#fff" }}>
                Sair do site
              </Button>
             <Button
                onClick={() => setDeclined(false)}
                size="lg"
                className="flex-1 border border-[#8B3A41] text-[#F3E9E8] bg-transparent transition-all duration-200 hover:bg-white/10 hover:text-[#F3E9E8] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#8B3A41]/40"
                variant="ghost"
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeGate;
