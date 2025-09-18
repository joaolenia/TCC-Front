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
  try {
    const response = await api.post('/v1/integracao/zoneamentos', data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data: errorData } = error.response;

      if (status === 400) {
        let errorMessage = 'Erro de validação no formulário.';

        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(' | ');
        }
        else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      throw new Error(`Erro ${status}: ${errorData.message || 'Erro desconhecido do servidor.'}`);
    }

    throw new Error(error.message || 'Erro ao comunicar com a API.');
  }
}

export async function updateZoneamento(id: number, data: Partial<ZoneamentoInput>): Promise<Zoneamento> {
  try {
    const response = await api.patch(`/v1/integracao/zoneamentos/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data: errorData } = error.response;

      if (status === 400) {
        let errorMessage = 'Erro de validação no formulário.';

        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(' | ');
        }
        else if (errorData.message) {
          errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
      }

      throw new Error(`Erro ${status}: ${errorData.message || 'Erro desconhecido do servidor.'}`);
    }

    throw new Error(error.message || 'Erro ao comunicar com a API.');
  }
}


export async function deleteZoneamento(id: number): Promise<void> {
  await api.delete(`/v1/integracao/zoneamentos/${id}`);
}