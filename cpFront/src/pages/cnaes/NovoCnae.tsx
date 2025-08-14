import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCnae } from '../../services/cnaes';
import './Cnae.css';

export default function NovoCnae() {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !descricao) {
      setError('O código e a descrição do CNAE são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await createCnae({ codigo, descricao });
      navigate('/cnaes');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar o novo CNAE. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-plus-circle" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Cadastrar Novo CNAE
        </h1>
      </header>
      <nav className="nav-actions">
        <button onClick={() => navigate('/cnaes')} className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </nav>
      <main className="form-container">
        <form onSubmit={handleSubmit} className="cnae-form">
          <div className="form-card">
            <h3><i className="fas fa-briefcase"></i> Detalhes do CNAE</h3>
            <div className="input-group">
              <label htmlFor="codigo">Código</label>
              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ex: 0111-3/02"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Cultivo de milho"
                rows={4}
                required
              />
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/cnaes')} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : (<><i className="fas fa-save"></i> Salvar CNAE</>)}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}