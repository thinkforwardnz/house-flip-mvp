import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import AppLayout from "./components/AppLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Find from "./pages/Find";
import PropertyAnalysis from "./pages/PropertyAnalysis";
import OfferStage from "./pages/OfferStage";
import UnderContract from "./pages/UnderContract";
import RenovationManagement from "./pages/RenovationManagement";
import Listed from "./pages/Listed";
import Sold from "./pages/Sold";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AIChatWidget from "./components/AIChatWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Index />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/find"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Find />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PropertyAnalysis />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analysis/:dealId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PropertyAnalysis />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/offer"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OfferStage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/under-contract"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UnderContract />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/renovation"
        element={
          <ProtectedRoute>
            <AppLayout>
              <RenovationManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/listed"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Listed />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sold"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Sold />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
            <AIChatWidget />
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
