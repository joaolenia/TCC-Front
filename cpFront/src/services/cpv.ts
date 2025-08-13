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


export async function fetchConsultasPreviasResumo(): Promise<ConsultaPreviaResumo[]> {
  try {
    const response = await api.get('/v1/integracao/consultas-previas/resumo');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar o resumo das consultas prévias:", error);
    throw new Error('Não foi possível carregar o resumo das consultas.');
  }
}