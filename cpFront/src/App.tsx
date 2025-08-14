import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/home/Home';
import DetalhesConsulta from './pages/details/Details';
import GerenciamentoZoneamento from './pages/zoneamento/Zoneamento';
import NovaZona from './components/NovaZona';
import Login from './pages/login/Login';
import EditarZona from './components/EditarZona';
// Imports para as novas páginas de CNAE
import GerenciarCnaes from './pages/cnaes/GerenciarCnaes';
import NovoCnae from './pages/cnaes/NovoCnae';
import EditarCnae from './pages/cnaes/EditarCnae';

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
        path="/detalhes/:id"
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
      <Route 
        path="/zoneamento/editar/:id" 
        element={
          <PrivateRoute>
            <EditarZona />
          </PrivateRoute>
        } 
      />

      {/* Novas Rotas para CNAE */}
      <Route
        path="/cnaes"
        element={
          <PrivateRoute>
            <GerenciarCnaes />
          </PrivateRoute>
        }
      />
      <Route
        path="/cnaes/novo"
        element={
          <PrivateRoute>
            <NovoCnae />
          </PrivateRoute>
        }
      />
      <Route
        path="/cnaes/editar/:id"
        element={
          <PrivateRoute>
            <EditarCnae />
          </PrivateRoute>
        }
      />

      {/* Rota curinga */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;