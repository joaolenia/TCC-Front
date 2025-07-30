// src/pages/DetalhesConsulta.tsx
import './Details.css';

type AnaliseStep = {
  status: 'success' | 'error';
  titulo: string;
  descricao: string;
};

type DetalhesConsultaData = {
  protocolo: string;
  dataSolicitacao: string;
  objetoSocial: string;
  statusAnalise: 'Deferido' | 'Indeferido' | 'Em Análise';

  solicitante: {
    nome: string;
    cpfCnpj: string;
    email: string;
    telefone: string;
  };

  enderecoAtividade: {
    logradouro: string;
    bairro: string;
    municipioUF: string;
    areaUtilizada: string;
  };

  atividadesCNAE: {
    principal: string;
    secundarias: string;
  };

  analiseAutomatica: {
    passos: AnaliseStep[];
    resultadoFinalTitulo: string;
    resultadoFinalDescricao: string;
  };
};

const dadosMock: DetalhesConsultaData = {
  protocolo: 'PR202500876',
  dataSolicitacao: '29 de Julho de 2025, 14:30',
  objetoSocial: 'Desenvolvimento de programas de computador sob encomenda.',
  statusAnalise: 'Deferido',

  solicitante: {
    nome: 'Carlos Ferreira de Souza',
    cpfCnpj: '123.456.789-00',
    email: 'carlos.souza@emailprovider.com',
    telefone: '(42) 99988-7766',
  },

  enderecoAtividade: {
    logradouro: 'Rua da Inovação, 123',
    bairro: 'Centro',
    municipioUF: 'Cruz Machado - PR',
    areaUtilizada: '120 m²',
  },

  atividadesCNAE: {
    principal:
      '6201-5/01 - Desenvolvimento de programas de computador sob encomenda',
    secundarias: '6204-0/00 - Consultoria em tecnologia da informação',
  },

  analiseAutomatica: {
    passos: [
      {
        status: 'success',
        titulo: 'Validação de Endereço',
        descricao:
          'Logradouro e número localizados na base de dados municipal.',
      },
      {
        status: 'success',
        titulo: 'Validação de Atividades (CNAE)',
        descricao:
          'As atividades informadas são permitidas para o zoneamento do endereço.',
      },
    ],
    resultadoFinalTitulo: 'Deferido',
    resultadoFinalDescricao:
      'A solicitação atende a todos os critérios de zoneamento e uso do solo do município. A atividade pode ser exercida no local informado.',
  },
};

export default function DetalhesConsulta() {
  const d = dadosMock;
  return (
    <div className="container">
      <header className="top-header">
        <h1>Detalhes da Consulta</h1>
        <div className="user-profile">
          <span>Servidor Municipal</span>
          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="Foto do servidor"
          />
        </div>
      </header>

      <nav className="nav-actions">
        <a href="#" className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </a>
        <div className="action-buttons">
          <button className="btn-acao btn-editar">
            <i className="fas fa-edit"></i> Editar Resultado
          </button>
          <button className="btn-acao btn-pdf">
            <i className="fas fa-file-pdf"></i> Gerar Relatório PDF
          </button>
        </div>
      </nav>

      <main className="details-layout">
        <section className="info-card">
          <h3>
            <i className="fas fa-file-alt"></i> Dados da Solicitação
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Protocolo REDESIM</span>
              <span className="item-value">{d.protocolo}</span>
            </div>
            <div className="item">
              <span className="item-label">Data da Solicitação</span>
              <span className="item-value">{d.dataSolicitacao}</span>
            </div>
            <div className="item">
              <span className="item-label">Objeto Social</span>
              <span className="item-value">{d.objetoSocial}</span>
            </div>
            <div className="item">
              <span className="item-label">Status da Análise</span>
              <span className="item-value">
                <span className="status-tag-grande">{d.statusAnalise}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>
            <i className="fas fa-user-tie"></i> Dados do Solicitante
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Nome / Razão Social</span>
              <span className="item-value">{d.solicitante.nome}</span>
            </div>
            <div className="item">
              <span className="item-label">CPF / CNPJ</span>
              <span className="item-value">{d.solicitante.cpfCnpj}</span>
            </div>
            <div className="item">
              <span className="item-label">E-mail</span>
              <span className="item-value">{d.solicitante.email}</span>
            </div>
            <div className="item">
              <span className="item-label">Telefone</span>
              <span className="item-value">{d.solicitante.telefone}</span>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>
            <i className="fas fa-map-marker-alt"></i> Endereço da Atividade
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Logradouro</span>
              <span className="item-value">{d.enderecoAtividade.logradouro}</span>
            </div>
            <div className="item">
              <span className="item-label">Bairro</span>
              <span className="item-value">{d.enderecoAtividade.bairro}</span>
            </div>
            <div className="item">
              <span className="item-label">Município / UF</span>
              <span className="item-value">{d.enderecoAtividade.municipioUF}</span>
            </div>
            <div className="item">
              <span className="item-label">Área Utilizada</span>
              <span className="item-value">{d.enderecoAtividade.areaUtilizada}</span>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>
            <i className="fas fa-briefcase"></i> Atividades (CNAE)
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">CNAE Principal</span>
              <span className="item-value">{d.atividadesCNAE.principal}</span>
            </div>
            <div className="item">
              <span className="item-label">CNAEs Secundárias</span>
              <span className="item-value">{d.atividadesCNAE.secundarias}</span>
            </div>
          </div>
        </section>

        <section className="info-card analise-card">
          <h3>
            <i className="fas fa-cogs"></i> Análise Automática do Sistema
          </h3>
          <div className="analise-steps">
            {d.analiseAutomatica.passos.map((step, i) => (
              <div key={i} className={`step ${step.status}`}>
                <span className="step-icon">
                  <i
                    className={`fas ${
                      step.status === 'success' ? 'fa-check' : 'fa-times'
                    }`}
                  ></i>
                </span>
                <div className="step-info">
                  <p>{step.titulo}</p>
                  <span>{step.descricao}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="justificativa-final">
            <h4>Resultado Final: {d.analiseAutomatica.resultadoFinalTitulo}</h4>
            <p>{d.analiseAutomatica.resultadoFinalDescricao}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
