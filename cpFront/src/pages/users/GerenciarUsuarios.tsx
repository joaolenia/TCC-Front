// src/pages/usuarios/GerenciarUsuarios.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Usuario, fetchUsuarios } from '../../services/usuarios';
import './GerenciarUsuarios.css';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios()
      .then(data => setUsuarios(data))
      .catch(() => setError('Erro ao carregar usuários.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="sigum-usuario-container"><p>Carregando...</p></div>;
  if (error) return <div className="sigum-usuario-container"><p>{error}</p></div>;

  return (
    <div className="sigum-usuario-container">
      <header className="sigum-usuario-top-header">
        <h1><i className="fas fa-users-cog"></i> Gerenciamento de Usuários</h1>
        <p>Adicione, edite ou remova usuários do sistema.</p>
      </header>

      <nav className="sigum-usuario-nav-actions">
        <button className="sigum-usuario-btn-voltar" onClick={() => navigate('/home')}>
          <i className="fas fa-arrow-left"></i> Voltar ao Painel
        </button>
        <button className="sigum-usuario-btn-novo" onClick={() => navigate('/usuarios/novo')}>
          <i className="fas fa-plus"></i> Cadastrar Novo Usuário
        </button>
      </nav>

      <main className="sigum-usuario-grid">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="sigum-usuario-card">
            <div className="sigum-usuario-card-header">
              <div className="sigum-usuario-card-title">
                <i className={`fas ${usuario.role === 'ADMIN' ? 'fa-user-shield' : 'fa-user'}`}></i>
                <h3>{usuario.email}</h3>
              </div>
              <button className="sigum-usuario-btn-editar" onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}>
                <i className="fas fa-pencil-alt"></i>
              </button>
            </div>
            <div className="sigum-usuario-card-body">
              <p>CPF: {usuario.cpf}</p>
              <p>Perfil: <span className={`sigum-usuario-role-tag ${usuario.role.toLowerCase()}`}>{usuario.role}</span></p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}