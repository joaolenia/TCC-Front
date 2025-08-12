import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export interface ZoneamentoInput {
  nome: string;
  descricao: string;
  cnaesPermitidosIds: number[];
}

export interface Zoneamento {
  id: number;
  nome: string;
  descricao: string;
  cnaesPermitidos: {
    id: number;
    codigo: string;
    descricao: string;
  }[];
}

export async function fetchZoneamentos(): Promise<Zoneamento[]> {
  const response = await api.get('/v1/integracao/zoneamentos');
  return response.data;
}

export async function createZoneamento(data: ZoneamentoInput): Promise<Zoneamento> {
  const response = await api.post('/v1/integracao/zoneamentos', data);
  return response.data;
}
