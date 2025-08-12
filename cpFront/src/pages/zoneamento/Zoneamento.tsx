// src/pages/GerenciamentoZoneamento.tsx
import './Zoneamento.css';
import { fetchZoneamentos } from '../../services/zoneamento';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    fetchZoneamentos()
      .then((data) => setZonas(data))
      .catch((err) => setError(err.message || 'Erro ao carregar zonas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Carregando zonas...</div>;
  if (error) return <div className="container">Erro: {error}</div>;

  // Função auxiliar para definir a classe CSS da zona baseado em CNAEs ou nome
  const getTipoClass = (zona: Zona): string => {
    // Como você não tem um campo 'tipo' na API, podemos definir regras simples:
    if (zona.nome.toLowerCase().includes('comercial')) return 'comercial';
    if (zona.nome.toLowerCase().includes('residencial')) return 'residencial';
    if (zona.nome.toLowerCase().includes('industrial')) return 'industrial';
    if (zona.nome.toLowerCase().includes('mista')) return 'mista';
    return 'comercial'; // padrão
  };

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-city" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Gerenciamento de Zoneamento
        </h1>
      </header>

      <nav className="nav-actions">
        <a href="#" className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </a>
        <button className="btn-nova-zona">
          <i className="fas fa-plus"></i> Cadastrar Nova Zona
        </button>
      </nav>

      <main className="zonas-grid">
        {zonas.map((zona) => (
          <div key={zona.id} className={`zona-card ${getTipoClass(zona)}`}>
            <div className="card-header">
              <h3>{zona.nome}</h3>
              <button className="btn-editar">
                <i className="fas fa-pencil-alt"></i> Editar
              </button>
            </div>
            <div className="card-body">
              <p>{zona.descricao}</p>
              <div className="atividades-section">
                <h4>Atividades Permitidas:</h4>
                <div className="tags-container">
                  {zona.cnaesPermitidos.map((cnae) => (
                    <span key={cnae.id} className="tag" title={cnae.descricao}>
                      {cnae.codigo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
