import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createZoneamento } from '../services/zoneamento';
import { fetchCnaes } from '../services/cnaes';
import './NovaZona.css';

type Cnae = {
  id: number;
  codigo: string;
  descricao: string;
};

const converterTextoParaGeoJson = (texto: string): object | null => {
  if (!texto.trim()) {
    return null;
  }

  const linhas = texto.trim().split('\n').filter(linha => linha.trim() !== '');

  const coordenadas = linhas.map(linha => {
    const limpo = linha.replace(/[\[\]]/g, '');
    const partes = limpo.split(',').map(num => parseFloat(num.trim()));
    return partes.filter(num => !isNaN(num));
  }).filter(coord => coord.length >= 2);

  if (coordenadas.length < 3) {
    throw new Error("São necessárias pelo menos 3 coordenadas para formar um polígono válido.");
  }

  const primeiroPonto = coordenadas[0];
  const ultimoPonto = coordenadas[coordenadas.length - 1];
  if (primeiroPonto[0] !== ultimoPonto[0] || primeiroPonto[1] !== ultimoPonto[1]) {
    coordenadas.push(primeiroPonto);
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordenadas],
        },
        properties: {},
      },
    ],
  };
};

export default function NovaZona() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [coordenadasTexto, setCoordenadasTexto] = useState('');
  const [cnaesDisponiveis, setCnaesDisponiveis] = useState<Cnae[]>([]);
  const [cnaesSelecionados, setCnaesSelecionados] = useState<number[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchCnaes()
      .then(data => setCnaesDisponiveis(data))
      .catch(() => setError('Falha ao carregar a lista de CNAEs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCnaeChange = (cnaeId: number) => {
    setCnaesSelecionados(prev =>
      prev.includes(cnaeId)
        ? prev.filter(id => id !== cnaeId)
        : [...prev, cnaeId]
    );
  };

  const cnaesFiltrados = useMemo(() => {
    if (!termoBusca) {
      return cnaesDisponiveis;
    }
    return cnaesDisponiveis.filter(cnae =>
      cnae.codigo.includes(termoBusca) ||
      cnae.descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [termoBusca, cnaesDisponiveis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || cnaesSelecionados.length === 0) {
      setError('O nome da zona e a seleção de ao menos um CNAE são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const area = converterTextoParaGeoJson(coordenadasTexto);
      
      const novaZona = {
        nome,
        descricao,
        cnaesPermitidosIds: cnaesSelecionados,
        area: area, 
      };

      await createZoneamento(novaZona);
      navigate('/zoneamento');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a nova zona. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-plus-circle" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Cadastrar Nova Zona
        </h1>
      </header>
      <nav className="nav-actions">
        <button onClick={() => navigate('/zoneamento')} className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </nav>
      <main className="form-container">
        <form onSubmit={handleSubmit} className="zona-form">
          <div className="form-card">
            <h3><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h3>
            <div className="input-group">
              <label htmlFor="nome">Nome da Zona</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Zona Industrial Agro"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Área para atividades industriais relacionadas ao agronegócio"
                rows={4}
              />
            </div>
            <div className="input-group">
              <label htmlFor="coordenadas">Coordenadas do Polígono</label>
              <textarea
                id="coordenadas"
                value={coordenadasTexto}
                onChange={(e) => setCoordenadasTexto(e.target.value)}
                placeholder="Cole as coordenadas aqui, uma por linha. Ex: [-51.35, -26.01, 0],"
                rows={10}
                style={{ fontFamily: 'monospace', lineHeight: '1.5' }}
              />
            </div>
          </div>

          <div className="form-card">
            <h3><i className="fas fa-tasks"></i> Atividades Permitidas (CNAE)</h3>
            <div className="cnae-search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Buscar por código ou descrição do CNAE..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <div className="cnae-list">
              {loading && <p>Carregando CNAEs...</p>}
              {!loading && cnaesFiltrados.length === 0 && <p>Nenhum CNAE encontrado.</p>}
              {cnaesFiltrados.map(cnae => (
                <div key={cnae.id} className="cnae-item">
                  <input
                    type="checkbox"
                    id={`cnae-${cnae.id}`}
                    checked={cnaesSelecionados.includes(cnae.id)}
                    onChange={() => handleCnaeChange(cnae.id)}
                  />
                  <label htmlFor={`cnae-${cnae.id}`} title={cnae.descricao}>
                    {cnae.codigo} - {cnae.descricao}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/zoneamento')} className="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="btn-salvar" disabled={loading}>
              {loading ? 'Salvando...' : (<><i className="fas fa-save"></i> Salvar Zona</>)}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}