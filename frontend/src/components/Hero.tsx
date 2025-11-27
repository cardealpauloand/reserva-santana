import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-wine.jpg";

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
      </div>
      
      <div className="relative container px-4 md:px-6 py-24 md:py-32">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 backdrop-blur-sm px-4 py-2 border border-secondary/30">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground">Oferta Exclusiva</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            Vinhos Selecionados com até{" "}
            <span className="text-secondary">69% OFF</span>
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/90">
            Descubra nossa coleção premium de vinhos importados e nacionais. 
            Qualidade excepcional, preços especiais.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/catalogo">
              <Button variant="hero" size="lg">
                Ver Catálogo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
