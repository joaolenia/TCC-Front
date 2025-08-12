import React from 'react'; // 1. Adicione esta linha
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import DetalhesConsulta from './pages/Details';
import GerenciamentoZoneamento from './pages/zoneamento/Zoneamento';
import Login from './pages/Login';

// 2. Tipo para as props do PrivateRoute
type PrivateRouteProps = {
  children: React.ReactNode;
};

// Componente para proteger rotas
function PrivateRoute({ children }: PrivateRouteProps) { // 3. Use o novo tipo
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();

  if (!isAuthenticated) {
    // Redireciona para a página de login, salvando a rota atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>; // É uma boa prática envolver em um Fragment
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
      {/* Rota curinga para redirecionar para a página principal */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;