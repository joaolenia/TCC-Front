import api from './api';

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
  try {
    const response = await api.post('/v1/integracao/cnaes', data);
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


export async function updateCnae(id: number, data: Partial<CnaeInput>): Promise<Cnae> {
  try {
    const response = await api.patch(`/v1/integracao/cnaes/${id}`, data);
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


export async function deleteCnae(id: number): Promise<void> {
  await api.delete(`/v1/integracao/cnaes/${id}`);
}