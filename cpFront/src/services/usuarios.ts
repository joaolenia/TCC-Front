import api from './api';

export interface Usuario {
  id: number;
  email: string;
  cpf: string;
  role: string;
}

export interface UsuarioInput {
  email: string;
  cpf: string;
  senha?: string; 
  role: 'ADMIN' | 'PADRAO';
}

export async function fetchUsuarios(): Promise<Usuario[]> {
  const response = await api.get('/usuarios');
  return response.data;
}

export async function fetchUsuarioById(id: number): Promise<Usuario> {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
}

export async function createUsuario(data: UsuarioInput): Promise<Usuario> {
  try {
    const response = await api.post('/usuarios', data);
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

export async function updateUsuario(id: number, data: Partial<UsuarioInput>): Promise<Usuario> {
  try {
    const response = await api.put(`/usuarios/${id}`, data);
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

export async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}