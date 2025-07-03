import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuthNew';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LocalStorageStatus } from './components/LocalStorageStatus';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard.simple';
import NotFound from './pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <LocalStorageStatus />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;