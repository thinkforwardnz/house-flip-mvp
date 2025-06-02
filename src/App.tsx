
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyAnalysis from "./pages/PropertyAnalysis";
import OfferStage from "./pages/OfferStage";
import UnderContract from "./pages/UnderContract";
import RenovationManagement from "./pages/RenovationManagement";
import Listed from "./pages/Listed";
import Sold from "./pages/Sold";
import NotFound from "./pages/NotFound";
import AIChatWidget from "./components/AIChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analysis" element={<PropertyAnalysis />} />
          <Route path="/offer" element={<OfferStage />} />
          <Route path="/under-contract" element={<UnderContract />} />
          <Route path="/renovation" element={<RenovationManagement />} />
          <Route path="/listed" element={<Listed />} />
          <Route path="/sold" element={<Sold />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
