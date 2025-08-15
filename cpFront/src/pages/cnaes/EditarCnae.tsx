// src/pages/cnaes/EditarCnae.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCnaeById, updateCnae, deleteCnae } from '../../services/cnaes';
import './Cnae.css';

export default function EditarCnae() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const cnaeId = Number(id);
    if (isNaN(cnaeId)) {
      setError('ID do CNAE inválido.');
      setPageLoading(false);
      return;
    }

    fetchCnaeById(cnaeId)
      .then(data => {
        setCodigo(data.codigo);
        setDescricao(data.descricao);
      })
      .catch(() => setError('Falha ao carregar os dados do CNAE.'))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo || !descricao) {
      setError('O código e a descrição são obrigatórios.');
      return;
    }
    setFormLoading(true);
    setError(null);
    try {
      await updateCnae(Number(id), { codigo, descricao });
      navigate('/cnaes');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o CNAE.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o CNAE "${codigo}"? Esta ação não pode ser desfeita.`)) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteCnae(Number(id));
        navigate('/cnaes');
      } catch {
        setError('Erro ao excluir o CNAE.');
      } finally {
        setFormLoading(false);
      }
    }
  };
  
  if (pageLoading) return <div className="sigum-cnae-form-container"><p>Carregando dados do CNAE...</p></div>;

  return (
    <div className="sigum-cnae-form-container">
      <header className="sigum-cnae-form-header">
        <h1><i className="fas fa-edit"></i> Editar CNAE</h1>
        <button onClick={() => navigate('/cnaes')} className="sigum-cnae-form-btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </header>
      <main className="sigum-cnae-form-main">
        <form onSubmit={handleUpdate} className="sigum-cnae-form-body">
          <div className="sigum-cnae-form-card">
            <h3><i className="fas fa-briefcase"></i> Detalhes do CNAE</h3>
            <div className="sigum-cnae-form-input-group">
              <label htmlFor="codigo">Código</label>
              <input id="codigo" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div className="sigum-cnae-form-input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} required />
            </div>
          </div>
          
          {error && <p className="sigum-cnae-form-error-message">{error}</p>}

          <div className="sigum-cnae-form-actions-edit">
            <button type="button" onClick={handleDelete} className="sigum-cnae-form-btn-excluir" disabled={formLoading}>
              <i className="fas fa-trash-alt"></i> Excluir CNAE
            </button>
            <div className="sigum-cnae-form-actions-right">
              <button type="button" onClick={() => navigate('/cnaes')} className="sigum-cnae-form-btn-cancelar">Cancelar</button>
              <button type="submit" className="sigum-cnae-form-btn-salvar" disabled={formLoading}>
                {formLoading ? <span className="sigum-cnae-form-spinner"></span> : <><i className="fas fa-save"></i> Salvar Alterações</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}