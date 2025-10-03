import { Button } from "@/components/ui/button";
import { Sparkles, Wine, Award, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-wine.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const slides = [
  {
    icon: Sparkles,
    badge: "Oferta Exclusiva",
    title: "Vinhos Selecionados com até",
    highlight: "69% OFF",
    description: "Descubra nossa coleção premium de vinhos importados e nacionais. Qualidade excepcional, preços especiais.",
    image: heroImage,
  },
  {
    icon: Wine,
    badge: "Edição Limitada",
    title: "Vinhos Premiados",
    highlight: "Imperdível",
    description: "Experimente vinhos que conquistaram medalhas em concursos internacionais. Sabor e tradição em cada garrafa.",
    image: heroImage,
  },
  {
    icon: Award,
    badge: "Coleção Especial",
    title: "Harmonização Perfeita",
    highlight: "Para Você",
    description: "Encontre o vinho ideal para cada momento. Nossos sommeliers selecionaram o melhor para sua ocasião.",
    image: heroImage,
  },
  {
    icon: TrendingUp,
    badge: "Novidades",
    title: "Lançamentos",
    highlight: "Em Destaque",
    description: "Seja o primeiro a experimentar os novos rótulos que acabaram de chegar. Exclusividade e qualidade.",
    image: heroImage,
  },
];

export const HeroCarousel = () => {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="relative w-full overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <CarouselItem key={index}>
                <div className="relative w-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
                  </div>
                  
                  <div className="relative container px-4 md:px-6 py-24 md:py-32">
                    <div className="max-w-2xl space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 backdrop-blur-sm px-4 py-2 border border-secondary/30">
                        <Icon className="h-4 w-4 text-secondary" />
                        <span className="text-sm font-medium text-primary-foreground">{slide.badge}</span>
                      </div>
                      
                      <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
                        {slide.title}{" "}
                        <span className="text-secondary">{slide.highlight}</span>
                      </h2>
                      
                      <p className="text-lg md:text-xl text-primary-foreground/90">
                        {slide.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4">
                        <Button variant="hero" size="lg">
                          Ver Ofertas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="bg-card/10 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-card/20"
                        >
                          Explorar Catálogo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  );
};
