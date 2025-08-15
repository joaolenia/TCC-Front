import api from './api';


export interface ZoneamentoInput {
  nome: string;
  descricao: string;
  cnaesPermitidosIds: number[];
  area?: any; 
}


export interface Zoneamento {
  id: number;
  nome: string;
  descricao: string;
  area?: any; 
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

export async function fetchZoneamentoById(id: number): Promise<Zoneamento> {
  const response = await api.get(`/v1/integracao/zoneamentos/${id}`);
  return response.data;
}


export async function createZoneamento(data: ZoneamentoInput): Promise<Zoneamento> {
  const response = await api.post('/v1/integracao/zoneamentos', data);
  return response.data;
}


export async function updateZoneamento(id: number, data: Partial<ZoneamentoInput>): Promise<Zoneamento> {
  const response = await api.patch(`/v1/integracao/zoneamentos/${id}`, data);
  return response.data;
}


export async function deleteZoneamento(id: number): Promise<void> {
  await api.delete(`/v1/integracao/zoneamentos/${id}`);
}