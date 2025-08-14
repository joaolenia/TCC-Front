import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  type ConsultaPreviaDetalhe,
  fetchConsultaPreviaById,
} from '../../services/cpv';

import { generateReport } from './Retatorio';
import './Details.css';

const formatarData = (dataString: string) => {
  if (!dataString) return 'Data não informada';
  const data = new Date(dataString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data);
};

const formatarCpfCnpj = (valor: string) => {
  if (!valor) return '';
  if (valor.length === 11) {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (valor.length === 14) {
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return valor;
}

export default function DetalhesConsulta() {
  const { id } = useParams<{ id: string }>();
  const [consulta, setConsulta] = useState<ConsultaPreviaDetalhe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID da consulta não encontrado na URL.');
      setLoading(false);
      return;
    }
    const carregarConsulta = async () => {
      try {
        setLoading(true);
        const data = await fetchConsultaPreviaById(Number(id));
        setConsulta(data);
        setError(null);
      } catch (err) {
        setError('Não foi possível carregar os dados da consulta.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregarConsulta();
  }, [id]);

  if (loading) {
    return <div className="container-feedback"><h1>Carregando...</h1></div>;
  }
  if (error) {
    return <div className="container-feedback error"><h1>Erro:</h1><p>{error}</p></div>;
  }
  if (!consulta) {
    return <div className="container-feedback"><h1>Consulta não encontrada.</h1></div>;
  }

  const atividadePrincipal = consulta.atividades.find(a => a.is_atividade_principal);
  const atividadesSecundarias = consulta.atividades
    .filter(a => !a.is_atividade_principal)
    .map(a => a.co_cnae)
    .join(', ');

  return (
    <div className="container">
      <header className="top-header">
        <h1>Detalhes da Consulta</h1>
        <div className="user-profile">
          <span>Servidor Municipal</span>
          <img src="https://i.pravatar.cc/150?img=12" alt="Foto do servidor" />
        </div>
      </header>

      <nav className="nav-actions">
        <a href="/" className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </a>
        <div className="action-buttons">
          <button className="btn-acao btn-pdf" onClick={() => generateReport(consulta)}>
            <i className="fas fa-file-pdf"></i> Gerar Relatório PDF
          </button>
        </div>
      </nav>

      <main className="details-layout">
        <section className="info-card">
          <h3>
            <i className="fas fa-file-alt"></i> Dados da Solicitação e Empresa
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Protocolo REDESIM</span>
              <span className="item-value">{consulta.co_protocolo_redesim}</span>
            </div>
            <div className="item">
              <span className="item-label">CNPJ</span>
              <span className="item-value">{formatarCpfCnpj(consulta.nu_cnpj)}</span>
            </div>
            <div className="item">
              <span className="item-label">Data da Solicitação</span>
              <span className="item-value">{formatarData(consulta.dt_solicitacao)}</span>
            </div>
            <div className="item">
              <span className="item-label">Opções de Nome</span>
              <span className="item-value">
                {consulta.opcoes_nome.map(o => o.ds_opcao_nome).join('; ')}
              </span>
            </div>
            <div className="item">
              <span className="item-label">Natureza Jurídica (Cód)</span>
              <span className="item-value">{consulta.co_natureza_juridica}</span>
            </div>
            <div className="item">
              <span className="item-label">Inscrição Municipal</span>
              <span className="item-value">{consulta.co_inscricao_municipal}</span>
            </div>
            <div className="item">
              <span className="item-label">Eventos REDESIM (Cód)</span>
              <span className="item-value">
                {consulta.eventos.map(e => e.co_evento).join(', ')}
              </span>
            </div>
            <div className="item">
              <span className="item-label">Objeto Social</span>
              <span className="item-value long-text">{consulta.ds_objeto_social}</span>
            </div>
          </div>
        </section>

        {/* Card: Dados do Solicitante (Contador) */}
        <section className="info-card">
          <h3>
            <i className="fas fa-user-tie"></i> Dados do Solicitante
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Nome</span>
              <span className="item-value">{consulta.solicitante.ds_nome}</span>
            </div>
            <div className="item">
              <span className="item-label">CPF</span>
              <span className="item-value">{formatarCpfCnpj(consulta.solicitante.nu_cpf)}</span>
            </div>
            <div className="item">
              <span className="item-label">E-mail</span>
              <span className="item-value">{consulta.solicitante.ds_email}</span>
            </div>
            <div className="item">
              <span className="item-label">Telefone</span>
              <span className="item-value">
                {`(${consulta.solicitante.nu_ddd_telefone}) ${consulta.solicitante.nu_telefone}`}
              </span>
            </div>
            <div className="item">
              <span className="item-label">É o contador?</span>
              <span className="item-value">{consulta.solicitante.is_contador ? 'Sim' : 'Não'}</span>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h3>
            <i className="fas fa-users"></i> Quadro Societário
          </h3>
          <div className="details-list">
            {consulta.socios.map(socio => (
              <div className="item" key={socio.id}>
                <span className="item-label">{socio.ds_nome}</span>
                <span className="item-value">CPF/CNPJ: {formatarCpfCnpj(socio.nu_cpf_cnpj)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="info-card">
          <h3>
            <i className="fas fa-map-marker-alt"></i> Endereço da Atividade
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Endereço</span>
              <span className="item-value">
                {`${consulta.endereco.ds_tipo_logradouro} ${consulta.endereco.ds_endereco}, ${consulta.endereco.nu_numero}`}
              </span>
            </div>
            <div className="item">
              <span className="item-label">Complemento</span>
              <span className="item-value">{consulta.endereco.ds_complemento || 'N/A'}</span>
            </div>
            <div className="item">
              <span className="item-label">Bairro</span>
              <span className="item-value">{consulta.endereco.ds_bairro}</span>
            </div>
            <div className="item">
              <span className="item-label">CEP</span>
              <span className="item-value">{consulta.endereco.co_cep}</span>
            </div>
            <div className="item">
              <span className="item-label">Município / UF (Cód)</span>
              <span className="item-value">{consulta.endereco.co_municipio}</span>
            </div>
            <div className="item">
              <span className="item-label">Inscrição Imobiliária</span>
              <span className="item-value">{consulta.endereco.natureza_imovel.nu_inscricao}</span>
            </div>
            <div className="item">
              <span className="item-label">Ponto de Referência</span>
              <span className="item-value">{consulta.endereco.ds_ponto_referencia}</span>
            </div>
            <div className="item">
              <span className="item-label">Coordenadas</span>
              <span className="item-value">{`Lat: ${consulta.endereco.coordenadas_geograficas.nu_latitude}, Lon: ${consulta.endereco.coordenadas_geograficas.nu_longitude}`}</span>
            </div>
            <div className="item">
              <span className="item-label">Área Total / Utilizada</span>
              <span className="item-value">
                {`${consulta.endereco.nu_area_total} m² / ${consulta.endereco.nu_area_utilizada} m²`}
              </span>
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
              <span className="item-value">
                {atividadePrincipal?.co_cnae || 'Não informado'}
              </span>
            </div>
            <div className="item">
              <span className="item-label">CNAEs Secundárias</span>
              <span className="item-value">
                {atividadesSecundarias || 'Não possui'}
              </span>
            </div>
          </div>
        </section>

        {consulta.questionario.length > 0 && (
          <section className="info-card">
            <h3>
              <i className="fas fa-question-circle"></i> Questionário
            </h3>
            <div className="details-list">
              {consulta.questionario.map(q => (
                <div className="item" key={q.id}>
                  <span className="item-label">{q.ds_pergunta}</span>
                  <span className="item-value">{q.ds_resposta}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="info-card analise-card">
          <h3>
            <i className="fas fa-tasks"></i> Análise e Zoneamento
          </h3>
          <div className="details-list">
            <div className="item">
              <span className="item-label">Classificação de Risco</span>
              <span className="item-value status-tag-grande">{consulta.classificacao_risco.ds_tipo_risco}</span>
            </div>
            <div className="item">
              <span className="item-label">Zoneamento</span>
              <span className="item-value">{consulta.zoneamento?.nome || 'Não informado'}</span>
            </div>
            <div className="item">
              <span className="item-label">Descrição do Zoneamento</span>
              <span className="item-value long-text">{consulta.zoneamento?.descricao || 'N/A'}</span>
            </div>
          </div>
          <div className="justificativa-final">
            <h4>Resultado Final: {consulta.situacao}</h4>
            <p>
              {consulta.observacoes || 'Nenhuma observação adicional foi registrada.'}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}