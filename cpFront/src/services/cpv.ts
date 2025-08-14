import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});


export interface ConsultaPreviaResumo {
  id: number;
  situacao:string,
  co_protocolo_redesim: string;
  nome_solicitante: string;
  endereco: string;
  dt_solicitacao: string; 
  cnaes: string[];
}


export interface ConsultaPreviaDetalhe {
  id: number;
  id_sigFacil: number;
  co_protocolo_redesim: string;
  dt_solicitacao: string;
  nu_cnpj: string;
  nu_cnpj_matriz: string;
  is_atualizacao_receita: boolean;
  ds_objeto_social: string;
  co_natureza_juridica: string;
  co_enquadramento: number;
  nu_cnpj_entidade_registro: string;
  nu_cnpj_entidade_registro_matriz: string;
  co_inscricao_municipal: string;
  solicitante: {
    id: number;
    nu_cpf: string;
    ds_nome: string;
    is_contador: boolean;
    nu_ddd_telefone: string;
    nu_telefone: string;
    nu_ramal: string;
    ds_email: string;
  };
  opcoes_nome: { id: number; ds_opcao_nome: string }[];
  atividades: {
    id: number;
    co_cnae: string;
    is_atividade_principal: boolean;
    is_exerce_no_endereco: boolean;
    atividades_especializadas: {
      id: number;
      co_cnae_especializada: string;
      is_atividade_principal: boolean;
      is_exerce_no_endereco: boolean;
    }[];
  }[];
  eventos: { id: number; co_evento: number }[];
  socios: { id: number; ds_nome: string; nu_cpf_cnpj: string; ds_nome_mae: string }[];
  endereco: {
    id: number;
    co_uf: number;
    co_cep: string;
    co_tipo_imovel: number;
    co_tipo_logradouro: number;
    ds_tipo_logradouro: string;
    ds_endereco: string;
    nu_numero: string;
    ds_bairro: string;
    ds_complemento: string;
    co_municipio: number;
    co_municipio_tom: number;
    nu_area_total: string;
    nu_area_utilizada: string;
    ds_ponto_referencia: string;
    natureza_imovel: {
      id: number;
      co_tipo_natureza: string;
      nu_inscricao: string;
    };
    coordenadas_geograficas: {
      id: number;
      nu_latitude: string;
      nu_longitude: string;
    };
  };
  tipo_unidade: { id: number; co_tipo_unidade: number }[];
  formas_atuacao: { id: number; co_forma_atuacao: number }[];
  utilizacao_solo: { id: number; co_utilizacao_solo: number; nu_autorizacao: string };
  questionario: { id: number; co_pergunta: number; ds_pergunta: string; ds_resposta: string }[];
  classificacao_risco: { id: number; ds_tipo_risco: string };
  zoneamento: {
    id: number;
    nome: string;
    descricao: string;
    cnaesPermitidos: { id: number; codigo: string; descricao: string }[];
    area: any;
  } | null;
  situacao: string;
  observacoes: string | null;
}

export async function fetchConsultaPreviaById(id: number): Promise<ConsultaPreviaDetalhe> {
  try {
    const response = await api.get(`/v1/integracao/consultas-previas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar a consulta prévia de ID ${id}:`, error);
    throw new Error('Não foi possível carregar os dados da consulta.');
  }
}


export async function fetchConsultasPreviasResumo(): Promise<ConsultaPreviaResumo[]> {
  try {
    const response = await api.get('/v1/integracao/consultas-previas/resumo');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar o resumo das consultas prévias:", error);
    throw new Error('Não foi possível carregar o resumo das consultas.');
  }
}