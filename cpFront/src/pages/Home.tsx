// src/pages/Home.tsx
import './Home.css';

type Consulta = {
  protocolo: string;
  status: 'Deferido' | 'Indeferido' | 'Em Análise';
  empresa: string;
  solicitante: string;
  endereco: string;
  cnae: string;
  data: string;
};

const estatisticas = {
  total: 152,
  deferidas: 118,
  indeferidas: 25,
  emAnalise: 9,
};

const consultas: Consulta[] = [
  {
    protocolo: 'PR202500876',
    status: 'Deferido',
    empresa: 'Empresa de Tecnologia e Inovação LTDA',
    solicitante: 'Carlos Ferreira de Souza',
    endereco: 'Rua da Inovação, 123, Centro',
    cnae: '6201-5/01 - Desenvolvimento de programas',
    data: '29/07/2025',
  },
  {
    protocolo: 'PR202500875',
    status: 'Indeferido',
    empresa: 'Restaurante Sabor da Cidade ME',
    solicitante: 'Ana Paula Oliveira',
    endereco: 'Av. Residencial das Flores, 500',
    cnae: '5611-2/01 - Restaurantes e similares',
    data: '28/07/2025',
  },
  {
    protocolo: 'PR202500879',
    status: 'Em Análise',
    empresa: 'Comércio de Roupas Estilo Único',
    solicitante: 'Juliana Martins Costa',
    endereco: 'Rua Comercial, 789, Bairro Novo',
    cnae: '4781-4/00 - Comércio varejista de artigos do vestuário',
    data: '30/07/2025',
  },
    {
    protocolo: 'PR202500879',
    status: 'Em Análise',
    empresa: 'Comércio de Roupas Estilo Único',
    solicitante: 'Juliana Martins Costa',
    endereco: 'Rua Comercial, 789, Bairro Novo',
    cnae: '4781-4/00 - Comércio varejista de artigos do vestuário',
    data: '30/07/2025',
  },
    {
    protocolo: 'PR202500879',
    status: 'Em Análise',
    empresa: 'Comércio de Roupas Estilo Único',
    solicitante: 'Juliana Martins Costa',
    endereco: 'Rua Comercial, 789, Bairro Novo',
    cnae: '4781-4/00 - Comércio varejista de artigos do vestuário',
    data: '30/07/2025',
  },
    {
    protocolo: 'PR202500879',
    status: 'Em Análise',
    empresa: 'Comércio de Roupas Estilo Único',
    solicitante: 'Juliana Martins Costa',
    endereco: 'Rua Comercial, 789, Bairro Novo',
    cnae: '4781-4/00 - Comércio varejista de artigos do vestuário',
    data: '30/07/2025',
  },
];

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <h1>Painel de Consultas</h1>
        <div className="user-profile">
          <span>Servidor Municipal</span>
          <img src="https://i.pravatar.cc/150?img=12" alt="Foto do servidor" />
        </div>
      </header>

      <section className="stats-panel">
        <div className="stat-card total">
          <h3>Total de Solicitações</h3>
          <p>{estatisticas.total}</p>
        </div>
        <div className="stat-card aprovadas">
          <h3>Consultas Deferidas</h3>
          <p>{estatisticas.deferidas}</p>
        </div>
        <div className="stat-card rejeitadas">
          <h3>Consultas Indeferidas</h3>
          <p>{estatisticas.indeferidas}</p>
        </div>
        <div className="stat-card em-analise">
          <h3>Em Análise</h3>
          <p>{estatisticas.emAnalise}</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Pesquisar por protocolo, solicitante ou endereço..."
          />
        </div>
        <button className="btn-nova-consulta">
          <i className="fas fa-plus"></i> Verificar Zoneamento
        </button>
      </div>

      <main className="consultas-grid">
        {consultas.map((consulta) => (
          <div key={consulta.protocolo} className="consulta-card">
            <div className="card-header">
              <span className="protocolo">Protocolo: {consulta.protocolo}</span>
              <span className={`status-tag ${consulta.status.toLowerCase().replace(' ', '-')}`}>
                {consulta.status}
              </span>
            </div>
            <div className="card-body">
              <h4>{consulta.empresa}</h4>
              <div className="info-item">
                <i className="fas fa-user-tie"></i>
                <span>Solicitante: {consulta.solicitante}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Endereço: {consulta.endereco}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-briefcase"></i>
                <span>CNAE Principal: {consulta.cnae}</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="data">Recebido em: {consulta.data}</span>
              <button className="btn-detalhes">Ver Detalhes</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
