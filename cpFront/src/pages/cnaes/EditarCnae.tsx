import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchCnaeById,
  updateCnae,
  deleteCnae,
} from '../../services/cnaes';
import './Cnae.css';

export default function EditarCnae() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cnaeId = Number(id);
    if (isNaN(cnaeId)) {
      setError('ID do CNAE inválido.');
      setLoading(false);
      return;
    }

    fetchCnaeById(cnaeId)
      .then(data => {
        setCodigo(data.codigo);
        setDescricao(data.descricao);
      })
      .catch(() => {
        setError('Falha ao carregar os dados do CNAE.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !descricao) {
      setError('O código e a descrição são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateCnae(Number(id), { codigo, descricao });
      navigate('/cnaes');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o CNAE.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o CNAE "${codigo}"?`)) {
      setLoading(true);
      setError(null);
      try {
        await deleteCnae(Number(id));
        navigate('/cnaes');
      } catch (err) {
        setError('Erro ao excluir o CNAE.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  if (loading) return <div className="container">Carregando dados do CNAE...</div>;

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-edit" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Editar CNAE
        </h1>
      </header>
      <nav className="nav-actions">
        <button onClick={() => navigate('/cnaes')} className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </nav>
      <main className="form-container">
        <form onSubmit={handleUpdate} className="cnae-form">
          <div className="form-card">
            <h3><i className="fas fa-briefcase"></i> Detalhes do CNAE</h3>
            <div className="input-group">
              <label htmlFor="codigo">Código</label>
              <input id="codigo" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} required />
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions-edit">
            <button type="button" onClick={handleDelete} className="btn-excluir" disabled={loading}>
              <i className="fas fa-trash-alt"></i> Excluir CNAE
            </button>
            <div>
              <button type="button" onClick={() => navigate('/cnaes')} className="btn-cancelar">Cancelar</button>
              <button type="submit" className="btn-salvar" disabled={loading}>
                {loading ? 'Salvando...' : <><i className="fas fa-save"></i> Salvar Alterações</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}