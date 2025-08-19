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
  senha?: string; // Senha é opcional na atualização
  role: 'ADMIN' | 'USER';
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
  const response = await api.post('/usuarios', data);
  return response.data;
}

export async function updateUsuario(id: number, data: Partial<UsuarioInput>): Promise<Usuario> {
  const response = await api.put(`/usuarios/${id}`, data);
  return response.data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}