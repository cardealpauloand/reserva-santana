import { Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const DashboardLoadingState = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </main>
    <Footer />
  </div>
);
