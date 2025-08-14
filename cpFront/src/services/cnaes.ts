import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export interface Cnae {
    id: number;
    codigo: string;
    descricao: string;
}

export interface CnaeInput {
  codigo: string;
  descricao: string;
}

export async function fetchCnaes(): Promise<Cnae[]> {
  const response = await api.get('/v1/integracao/cnaes');
  return response.data;
}

export async function fetchCnaeById(id: number): Promise<Cnae> {
  const response = await api.get(`/v1/integracao/cnaes/${id}`);
  return response.data;
}

export async function createCnae(data: CnaeInput): Promise<Cnae> {
  const response = await api.post('/v1/integracao/cnaes', data);
  return response.data;
}

export async function updateCnae(id: number, data: Partial<CnaeInput>): Promise<Cnae> {
  const response = await api.patch(`/v1/integracao/cnaes/${id}`, data);
  return response.data;
}

export async function deleteCnae(id: number): Promise<void> {
  await api.delete(`/v1/integracao/cnaes/${id}`);
}