// src/pages/cnaes/GerenciarCnaes.tsx
import './GerenciarCnaes.css';
import { fetchCnaes } from '../../services/cnaes';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type Cnae = {
  id: number;
  codigo: string;
  descricao: string;
};

export default function GerenciarCnaes() {
  const [cnaes, setCnaes] = useState<Cnae[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserRole(JSON.parse(user).role);
    }

    setLoading(true);
    fetchCnaes()
      .then((data) => setCnaes(data))
      .catch((err) => setError(err.message || 'Erro ao carregar CNAEs'))
      .finally(() => setLoading(false));
  }, []);

  const cnaesFiltrados = useMemo(() => {
    if (!termoBusca) {
      return cnaes;
    }
    const termo = termoBusca.toLowerCase();
    return cnaes.filter(cnae =>
      cnae.codigo.toLowerCase().includes(termo) ||
      cnae.descricao.toLowerCase().includes(termo)
    );
  }, [termoBusca, cnaes]);

  if (loading) return <div className="sigum-cnae-container"><p className="sigum-cnae-loading-message">Carregando CNAEs...</p></div>;
  if (error) return <div className="sigum-cnae-container"><p className="sigum-cnae-error-message">Erro: {error}</p></div>;

  return (
    <div className="sigum-cnae-container">
      <header className="sigum-cnae-top-header">
        <h1>
          <i className="fas fa-briefcase"></i>
          Gerenciamento de CNAE
        </h1>
        <p>Consulte, adicione ou edite os códigos de atividades econômicas.</p>
      </header>

      <nav className="sigum-cnae-nav-actions">
        <button className="sigum-cnae-btn-voltar" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </button>
        {userRole === 'ADMIN' && (
          <button
            className="sigum-cnae-btn-novo"
            onClick={() => navigate('/cnaes/novo')}
          >
            <i className="fas fa-plus"></i> Cadastrar Novo CNAE
          </button>
        )}
      </nav>

      <div className="sigum-cnae-toolbar">
        <div className="sigum-cnae-search-bar">
          <i className="fas fa-search"></i>
          <input
              type="text"
              placeholder="Pesquisar por código ou descrição..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      <main className="sigum-cnae-grid">
        {cnaesFiltrados.map((cnae) => (
          <div key={cnae.id} className="sigum-cnae-card">
            <div className="sigum-cnae-card-header">
                <div className="sigum-cnae-card-title">
                    <i className="fas fa-tag"></i>
                    <h3>{cnae.codigo}</h3>
                </div>
              {userRole === 'ADMIN' && (
                <button className="sigum-cnae-btn-editar"
                 onClick={() => navigate(`/cnaes/editar/${cnae.id}`)}>
                  <i className="fas fa-pencil-alt"></i>
                </button>
              )}
            </div>
            <div className="sigum-cnae-card-body">
              <p>{cnae.descricao}</p>
            </div>
          </div>
        ))}
        {!loading && cnaesFiltrados.length === 0 && (
            <div className="sigum-cnae-no-results">
                <p>Nenhum CNAE encontrado para o filtro aplicado.</p>
            </div>
        )}
      </main>
    </div>
  );
}