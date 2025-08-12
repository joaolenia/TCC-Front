import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export interface Cnaes {
    id: number;
    codigo: string;
    descricao: string;
}

export async function fetchCnaes(): Promise<Cnaes[]> {
  const response = await api.get('/v1/integracao/cnaes');
  return response.data;
}
