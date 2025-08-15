import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Partners from "./pages/Partners";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SeedAdmin from "./pages/SeedAdmin";
import Catalog from "./pages/Catalog";
import Track from "./pages/Track";
import NotFound from "./pages/NotFound";
import { PackageProvider } from "@/context/PackageContext";
import { FiltrosProvider } from "@/stores/filtrosStore";
import { PaqueteProvider } from "@/stores/paqueteStore";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FiltrosProvider>
        <PaqueteProvider>
          <PackageProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/paquete" element={<Dashboard />} />
                <Route path="/cotizacion" element={<Dashboard />} />
                <Route path="/seguimiento" element={<Track />} />
                <Route path="/aliados" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/seed-admin" element={<SeedAdmin />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/track/:code" element={<Track />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PackageProvider>
        </PaqueteProvider>
      </FiltrosProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
