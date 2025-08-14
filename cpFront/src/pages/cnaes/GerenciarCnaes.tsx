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
  const navigate = useNavigate();

  useEffect(() => {
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
    return cnaes.filter(cnae =>
      cnae.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      cnae.descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [termoBusca, cnaes]);

  if (loading) return <div className="container">Carregando CNAEs...</div>;
  if (error) return <div className="container">Erro: {error}</div>;

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-briefcase" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Gerenciamento de CNAE
        </h1>
      </header>

      <nav className="nav-actions">
        <a href="#" className="btn-voltar" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </a>
        <button
          className="btn-nova-zona"
          onClick={() => navigate('/cnaes/novo')}
        >
          <i className="fas fa-plus"></i> Cadastrar Novo CNAE
        </button>
      </nav>

      <div className="toolbar">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
              type="text"
              placeholder="Pesquisar por código ou descrição..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      <main className="cnae-grid">
        {cnaesFiltrados.map((cnae) => (
          <div key={cnae.id} className="cnae-card">
            <div className="card-header">
              <h3>{cnae.codigo}</h3>
              <button className="btn-editar"
               onClick={() => navigate(`/cnaes/editar/${cnae.id}`)}>
                <i className="fas fa-pencil-alt"></i> Editar
              </button>
            </div>
            <div className="card-body">
              <p>{cnae.descricao}</p>
            </div>
          </div>
        ))}
        {!loading && cnaesFiltrados.length === 0 && <p>Nenhum CNAE encontrado para o filtro aplicado.</p>}
      </main>
    </div>
  );
}