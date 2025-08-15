import './Zoneamento.css';
import { fetchZoneamentos } from '../../services/zoneamento';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Zona = {
  id: number;
  nome: string;
  descricao: string;
  cnaesPermitidos: {
    id: number;
    codigo: string;
    descricao: string;
  }[];
};

export default function GerenciamentoZoneamento() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserRole(JSON.parse(user).role);
    }
  }, []);

  const loadZonas = () => {
    setLoading(true);
    fetchZoneamentos()
      .then((data) => setZonas(data))
      .catch((err) => setError(err.message || 'Erro ao carregar zonas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (location.pathname === '/zoneamento') {
      loadZonas();
    }
  }, [location.pathname]);

  const getTipoClass = (zona: Zona): string => {
    const nome = zona.nome.toLowerCase();
    if (nome.includes('comercial')) return 'comercial';
    if (nome.includes('residencial')) return 'residencial';
    if (nome.includes('industrial')) return 'industrial';
    if (nome.includes('mista')) return 'mista';
    return 'default';
  };

  if (loading) return <div className="sigum-zoneamento-container"><p className="sigum-zoneamento-loading-message">Carregando zonas...</p></div>;
  if (error) return <div className="sigum-zoneamento-container"><p className="sigum-zoneamento-error-message">Erro: {error}</p></div>;

  return (
    <div className="sigum-zoneamento-container">
      <header className="sigum-zoneamento-top-header">
        <h1>
          <i className="fas fa-city"></i>
          Gerenciamento de Zoneamento
        </h1>
        <p>Crie, edite e visualize as zonas urbanas do município.</p>
      </header>

      <nav className="sigum-zoneamento-nav-actions">
        <button className="sigum-zoneamento-btn-voltar" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </button>
        {userRole === 'ADMIN' && (
          <button
            className="sigum-zoneamento-btn-nova-zona"
            onClick={() => navigate('/zoneamento/nova')}
          >
            <i className="fas fa-plus"></i> Cadastrar Nova Zona
          </button>
        )}
      </nav>

      <main className="sigum-zoneamento-grid">
        {zonas.map((zona) => (
          <div key={zona.id} className={`sigum-zoneamento-card ${getTipoClass(zona)}`}>
            <div className="sigum-zoneamento-card-header">
              <div className="sigum-zoneamento-card-title">
                <div className={`sigum-zoneamento-type-icon ${getTipoClass(zona)}`}>
                  <i className="fas fa-map-marked-alt"></i>
                </div>
                <h3>{zona.nome}</h3>
              </div>
              <div className="sigum-zoneamento-card-actions">
                <button 
                  className="sigum-zoneamento-btn-action"
                  onClick={() => navigate(`/zoneamento/detalhes/${zona.id}`)}
                  title="Visualizar no Mapa"
                >
                  <i className="fas fa-map-marked-alt"></i>
                </button>
                {userRole === 'ADMIN' && (
                  <button 
                    className="sigum-zoneamento-btn-action"
                    onClick={() => navigate(`/zoneamento/editar/${zona.id}`)}
                    title="Editar Zona"
                  >
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="sigum-zoneamento-card-body">
              <p className="sigum-zoneamento-card-description">{zona.descricao}</p>
              <div className="sigum-zoneamento-atividades-section">
                <h4>Atividades Permitidas (CNAEs)</h4>
                <div className="sigum-zoneamento-tags-container">
                  {zona.cnaesPermitidos.slice(0, 5).map((cnae) => (
                    <span key={cnae.id} className="sigum-zoneamento-tag" title={cnae.descricao}>
                      {cnae.codigo}
                    </span>
                  ))}
                  {zona.cnaesPermitidos.length > 5 && (
                     <span className="sigum-zoneamento-tag more">+{zona.cnaesPermitidos.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}