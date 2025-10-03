import wineRed1 from "@/assets/wine-red-1.jpg";
import wineWhite1 from "@/assets/wine-white-1.jpg";
import wineRose1 from "@/assets/wine-rose-1.jpg";
import wineSparkling1 from "@/assets/wine-sparkling-1.jpg";

export interface Product {
  id: number;
  name: string;
  origin: string;
  type: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  description?: string;
  volume?: string;
  alcohol?: string;
  temperature?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Château Margaux 2015",
    origin: "Bordeaux, França",
    type: "Tinto",
    price: 189.90,
    originalPrice: 349.90,
    rating: 5,
    image: wineRed1,
    description: "Um vinho excepcional da prestigiada região de Bordeaux. Safra 2015 premiada com notas complexas de frutas vermelhas maduras, taninos sedosos e final prolongado. Perfeito para ocasiões especiais e harmonização com carnes nobres.",
    volume: "750ml",
    alcohol: "13.5%",
    temperature: "16-18°C",
  },
  {
    id: 2,
    name: "Chardonnay Reserve",
    origin: "Mendoza, Argentina",
    type: "Branco",
    price: 89.90,
    originalPrice: 159.90,
    rating: 4,
    image: wineWhite1,
  },
  {
    id: 3,
    name: "Provence Rosé Premium",
    origin: "Provence, França",
    type: "Rosé",
    price: 129.90,
    originalPrice: 219.90,
    rating: 5,
    image: wineRose1,
  },
  {
    id: 4,
    name: "Champagne Veuve Clicquot",
    origin: "Champagne, França",
    type: "Espumante",
    price: 299.90,
    originalPrice: 499.90,
    rating: 5,
    image: wineSparkling1,
  },
  {
    id: 5,
    name: "Malbec Gran Reserva",
    origin: "Mendoza, Argentina",
    type: "Tinto",
    price: 119.90,
    originalPrice: 199.90,
    rating: 4,
    image: wineRed1,
  },
  {
    id: 6,
    name: "Sauvignon Blanc Estate",
    origin: "Marlborough, Nova Zelândia",
    type: "Branco",
    price: 99.90,
    originalPrice: 169.90,
    rating: 5,
    image: wineWhite1,
  },
  {
    id: 7,
    name: "Rosé d'Anjou",
    origin: "Loire, França",
    type: "Rosé",
    price: 79.90,
    originalPrice: 139.90,
    rating: 4,
    image: wineRose1,
  },
  {
    id: 8,
    name: "Prosecco DOC Brut",
    origin: "Veneto, Itália",
    type: "Espumante",
    price: 69.90,
    originalPrice: 119.90,
    rating: 4,
    image: wineSparkling1,
  },
  {
    id: 9,
    name: "Cabernet Sauvignon Reserve",
    origin: "Napa Valley, EUA",
    type: "Tinto",
    price: 159.90,
    originalPrice: 279.90,
    rating: 5,
    image: wineRed1,
  },
  {
    id: 10,
    name: "Pinot Grigio DOC",
    origin: "Veneto, Itália",
    type: "Branco",
    price: 79.90,
    originalPrice: 139.90,
    rating: 4,
    image: wineWhite1,
  },
];

export const categoryMap: Record<string, string> = {
  "tintos": "Tinto",
  "brancos": "Branco",
  "roses": "Rosé",
  "espumantes": "Espumante",
};

export const categoryNames: Record<string, string> = {
  "tintos": "Vinhos Tintos",
  "brancos": "Vinhos Brancos",
  "roses": "Vinhos Rosés",
  "espumantes": "Vinhos Espumantes",
};
