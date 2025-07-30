// src/pages/GerenciamentoZoneamento.tsx
import './Zoneamento.css';

type Zona = {
  id: string;
  nome: string;
  sigla: string;
  tipo: 'comercial' | 'residencial' | 'industrial' | 'mista';
  descricao: string;
  atividades: string[];
};

const zonasMock: Zona[] = [
  {
    id: 'zc',
    nome: 'Zona Central',
    sigla: 'ZC',
    tipo: 'comercial',
    descricao:
      'Área destinada prioritariamente a atividades comerciais e de serviços de alta densidade.',
    atividades: [
      'Comércio Varejista',
      'Serviços Pessoais',
      'Bancos',
      'Restaurantes',
      'Escritórios',
    ],
  },
  {
    id: 'zr1',
    nome: 'Zona Residencial 1',
    sigla: 'ZR-1',
    tipo: 'residencial',
    descricao:
      'Setor de uso estritamente residencial unifamiliar, com foco na baixa densidade populacional.',
    atividades: ['Residencial Unifamiliar'],
  },
  {
    id: 'zi',
    nome: 'Zona Industrial',
    sigla: 'ZI',
    tipo: 'industrial',
    descricao:
      'Área designada para a instalação de indústrias, depósitos e atividades de logística.',
    atividades: [
      'Indústria de Baixo Impacto',
      'Indústria de Médio Impacto',
      'Depósitos',
      'Transportadoras',
    ],
  },
  {
    id: 'zrm',
    nome: 'Zona Residencial Mista',
    sigla: 'ZRM',
    tipo: 'mista',
    descricao:
      'Permite a coexistência de moradias com comércios e serviços de pequeno porte e baixo impacto.',
    atividades: [
      'Residencial',
      'Comércio Local',
      'Padarias',
      'Farmácias',
      'Consultórios',
    ],
  },
];

export default function GerenciamentoZoneamento() {
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
        {zonasMock.map((zona) => (
          <div key={zona.id} className={`zona-card ${zona.tipo}`}>
            <div className="card-header">
              <h3>
                {zona.nome} ({zona.sigla})
              </h3>
              <button className="btn-editar">
                <i className="fas fa-pencil-alt"></i> Editar
              </button>
            </div>
            <div className="card-body">
              <p>{zona.descricao}</p>
              <div className="atividades-section">
                <h4>Atividades Permitidas:</h4>
                <div className="tags-container">
                  {zona.atividades.map((atividade, i) => (
                    <span key={i} className="tag">
                      {atividade}
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
