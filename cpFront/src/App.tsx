import React from 'react'; // 1. Linha adicionada
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import DetalhesConsulta from './pages/Details';
import GerenciamentoZoneamento from './pages/zoneamento/Zoneamento';
import NovaZona from './components/NovaZona';
import Login from './pages/Login';
import EditarZona from './components/EditarZona';
import GerenciamentoEnderecos from './pages/GerenciamentoEnderecos';

type PrivateRouteProps = {
  children: React.ReactNode;
};

function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/detalhes"
        element={
          <PrivateRoute>
            <DetalhesConsulta />
          </PrivateRoute>
        }
      />
      <Route
        path="/zoneamento"
        element={
          <PrivateRoute>
            <GerenciamentoZoneamento />
          </PrivateRoute>
        }
      />
      <Route
        path="/zoneamento/nova"
        element={
          <PrivateRoute>
            <NovaZona />
          </PrivateRoute>
        }
      />
      {/* Rota curinga */}
      <Route path="*" element={<Navigate to="/" />} />


     <Route 
        path="/zoneamento/editar/:id" 
        element={
          <PrivateRoute>
            <EditarZona />
          </PrivateRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />

            <Route 
        path="/zoneamento/:id/enderecos" 
        element={
          <PrivateRoute>
            <GerenciamentoEnderecos />
          </PrivateRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
  
}

export default App;
