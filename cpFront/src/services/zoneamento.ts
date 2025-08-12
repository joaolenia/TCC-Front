import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Cnae {
  id: number;
  codigo: string;
  descricao: string;
}

export interface Zoneamento {
  id: number;
  nome: string;
  descricao: string;
  cnaesPermitidos: Cnae[];
}

export async function fetchZoneamentos(): Promise<Zoneamento[]> {
  const response = await axios.get<Zoneamento[]>(`${API_BASE_URL}/v1/integracao/zoneamentos`);
  return response.data;
}
