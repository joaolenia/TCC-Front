import api from './api';

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface AuthResponse {
  access_token: string;
  usuario: {
    id: number;
    email: string;
    cpf: string;
    role: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post('/auth/login', credentials);
  return response.data;
}