import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUsuarioById, updateUsuario, deleteUsuario } from '../../services/usuarios';
import './Usuario.css';

export default function EditarUsuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState(''); // Opcional para troca
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const usuarioId = Number(id);
    if (isNaN(usuarioId)) {
      setError('ID de usuário inválido.');
      setPageLoading(false);
      return;
    }

    fetchUsuarioById(usuarioId)
      .then(data => {
        setEmail(data.email);
        setCpf(data.cpf);
        setRole(data.role as 'ADMIN' | 'USER');
      })
      .catch(() => setError('Falha ao carregar os dados do usuário.'))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !cpf) {
        setError('Email e CPF são obrigatórios.');
        return;
    }
    setFormLoading(true);
    setError(null);

    // Monta o payload apenas com os dados necessários
    const payload: { email: string; cpf: string; senha?: string; role: 'ADMIN' | 'USER' } = { email, cpf, role };
    if (senha) { // Inclui a senha no payload apenas se ela for preenchida
      payload.senha = senha;
    }

    try {
      await updateUsuario(Number(id), payload);
      navigate('/usuarios');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o usuário.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${email}"?`)) {
        setFormLoading(true);
        setError(null);
      try {
        await deleteUsuario(Number(id));
        navigate('/usuarios');
      } catch {
        setError('Erro ao excluir o usuário.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (pageLoading) return <div className="sigum-usuario-form-container"><p>Carregando dados do usuário...</p></div>;

  return (
    <div className="sigum-usuario-form-container">
       <header className="sigum-usuario-form-header">
        <h1><i className="fas fa-user-edit"></i> Editar Usuário</h1>
        <button onClick={() => navigate('/usuarios')} className="sigum-usuario-form-btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </header>
      <main className="sigum-usuario-form-main">
        <form onSubmit={handleUpdate} className="sigum-usuario-form-body">
            <div className="sigum-usuario-form-card">
                <h3><i className="fas fa-id-card"></i> Detalhes do Usuário</h3>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="cpf">CPF</label>
                    <input id="cpf" type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                </div>
                 <div className="sigum-usuario-form-input-group">
                    <label htmlFor="role">Perfil de Acesso</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')} required>
                        <option value="USER">Usuário Padrão</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="senha">Nova Senha</label>
                    <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para não alterar" />
                </div>
            </div>

            {error && <p className="sigum-usuario-form-error-message">{error}</p>}

            <div className="sigum-usuario-form-actions-edit">
                <button type="button" onClick={handleDelete} className="sigum-usuario-form-btn-excluir" disabled={formLoading}>
                    <i className="fas fa-trash-alt"></i> Excluir Usuário
                </button>
                <div className="sigum-usuario-form-actions-right">
                    <button type="button" onClick={() => navigate('/usuarios')} className="sigum-usuario-form-btn-cancelar">Cancelar</button>
                    <button type="submit" className="sigum-usuario-form-btn-salvar" disabled={formLoading}>
                        {formLoading ? <span className="sigum-usuario-form-spinner"></span> : <><i className="fas fa-save"></i> Salvar Alterações</>}
                    </button>
                </div>
            </div>
        </form>
      </main>
    </div>
  );
}