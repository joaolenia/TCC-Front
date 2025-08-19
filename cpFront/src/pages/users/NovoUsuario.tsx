import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUsuario } from '../../services/usuarios';
import './Usuario.css';

export default function NovoUsuario() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !cpf || !senha) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await createUsuario({ email, cpf, senha, role });
      navigate('/usuarios');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar o novo usuário. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sigum-usuario-form-container">
      <header className="sigum-usuario-form-header">
        <h1><i className="fas fa-user-plus"></i> Cadastrar Novo Usuário</h1>
        <button onClick={() => navigate('/usuarios')} className="sigum-usuario-form-btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </header>
      <main className="sigum-usuario-form-main">
        <form onSubmit={handleSubmit} className="sigum-usuario-form-body">
            <div className="sigum-usuario-form-card">
                 <h3><i className="fas fa-id-card"></i> Dados do Usuário</h3>
                 <div className="sigum-usuario-form-input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: usuario@email.com"
                        required
                    />
                </div>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="cpf">CPF</label>
                    <input
                        id="cpf"
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Ex: 123.456.789-00"
                        required
                    />
                </div>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="role">Perfil de Acesso</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')} required>
                        <option value="USER">Usuário Padrão</option>
                        <option value="ADMIN">Administrador</option>
                    </select>
                </div>
                <div className="sigum-usuario-form-input-group">
                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Crie uma senha forte"
                        required
                    />
                </div>
            </div>

            {error && <p className="sigum-usuario-form-error-message">{error}</p>}

            <div className="sigum-usuario-form-actions">
                <button type="button" onClick={() => navigate('/usuarios')} className="sigum-usuario-form-btn-cancelar">
                Cancelar
                </button>
                <button type="submit" className="sigum-usuario-form-btn-salvar" disabled={loading}>
                {loading ? <span className="sigum-usuario-form-spinner"></span> : <><i className="fas fa-save"></i> Salvar Usuário</>}
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}