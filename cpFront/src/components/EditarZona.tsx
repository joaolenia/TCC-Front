
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchZoneamentoById,
  updateZoneamento,
  deleteZoneamento,
} from '../services/zoneamento';
import { fetchCnaes } from '../services/cnaes';
import './NovaZona.css'; 

type Cnae = {
  id: number;
  codigo: string;
  descricao: string;
};

export default function EditarZona() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cnaesDisponiveis, setCnaesDisponiveis] = useState<Cnae[]>([]);
  const [cnaesSelecionados, setCnaesSelecionados] = useState<number[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const zoneId = Number(id);
    if (isNaN(zoneId)) {
      setError('ID da zona inválido.');
      setLoading(false);
      return;
    }

    // Busca os dados da Zona e a lista de todos os CNAEs em paralelo
    Promise.all([
      fetchZoneamentoById(zoneId),
      fetchCnaes()
    ]).then(([zonaData, cnaesData]) => {
      setNome(zonaData.nome);
      setDescricao(zonaData.descricao);
      setCnaesSelecionados(zonaData.cnaesPermitidos.map(cnae => cnae.id));
      setCnaesDisponiveis(cnaesData);
    }).catch(() => {
      setError('Falha ao carregar os dados da zona ou a lista de CNAEs.');
    }).finally(() => {
      setLoading(false);
    });

  }, [id]);

  const handleCnaeChange = (cnaeId: number) => {
    setCnaesSelecionados(prev =>
      prev.includes(cnaeId)
        ? prev.filter(id => id !== cnaeId)
        : [...prev, cnaeId]
    );
  };

  const cnaesFiltrados = useMemo(() => {
    if (!termoBusca) return cnaesDisponiveis;
    return cnaesDisponiveis.filter(cnae =>
      cnae.codigo.includes(termoBusca) ||
      cnae.descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [termoBusca, cnaesDisponiveis]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !descricao || cnaesSelecionados.length === 0) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const zoneId = Number(id);
      await updateZoneamento(zoneId, {
        nome,
        descricao,
        cnaesPermitidosIds: cnaesSelecionados,
      });
      navigate('/zoneamento');
    } catch (err) {
      setError('Erro ao atualizar a zona. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir a zona "${nome}"? Esta ação não pode ser desfeita.`)) {
      setLoading(true);
      setError(null);
      try {
        const zoneId = Number(id);
        await deleteZoneamento(zoneId);
        navigate('/zoneamento');
      } catch (err) {
        setError('Erro ao excluir a zona. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  if (loading) return <div className="container">Carregando dados da zona...</div>;

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-edit" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Editar Zona
        </h1>
      </header>
      <nav className="nav-actions">
        <button onClick={() => navigate('/zoneamento')} className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </nav>
      <main className="form-container">
        <form onSubmit={handleUpdate} className="zona-form">
          {/* ... campos do formulário (iguais ao de NovaZona) ... */}
          <div className="form-card">
            <h3><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h3>
            <div className="input-group">
              <label htmlFor="nome">Nome da Zona</label>
              <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} required />
            </div>
          </div>

          <div className="form-card">
            <h3><i className="fas fa-tasks"></i> Atividades Permitidas (CNAE)</h3>
            <div className="cnae-search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Buscar por código ou descrição..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </div>
            <div className="cnae-list">
              {cnaesFiltrados.map(cnae => (
                <div key={cnae.id} className="cnae-item">
                  <input type="checkbox" id={`cnae-${cnae.id}`} checked={cnaesSelecionados.includes(cnae.id)} onChange={() => handleCnaeChange(cnae.id)} />
                  <label htmlFor={`cnae-${cnae.id}`} title={cnae.descricao}>{cnae.codigo} - {cnae.descricao}</label>
                </div>
              ))}
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions-edit">
            <button type="button" onClick={handleDelete} className="btn-excluir" disabled={loading}>
                <i className="fas fa-trash-alt"></i> Excluir Zona
            </button>
            <div>
                <button type="button" onClick={() => navigate('/zoneamento')} className="btn-cancelar">Cancelar</button>
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