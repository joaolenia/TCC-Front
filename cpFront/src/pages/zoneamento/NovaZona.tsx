import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createZoneamento } from '../../services/zoneamento';
import { fetchCnaes } from '../../services/cnaes';
import './NovaZona.css';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

type Cnae = {
  id: number;
  codigo: string;
  descricao: string;
};

export default function NovaZona() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cnaesDisponiveis, setCnaesDisponiveis] = useState<Cnae[]>([]);
  const [cnaesSelecionados, setCnaesSelecionados] = useState<number[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [geoJsonArea, setGeoJsonArea] = useState<object | null>(null);
  const [fileName, setFileName] = useState<string>('');

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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setGeoJsonArea(null);
      setFileName('');
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setError(null);

    try {
      const zip = await JSZip.loadAsync(file);
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.kml'));

      if (!kmlFile) {
        throw new Error('Nenhum arquivo .kml foi encontrado dentro do .kmz.');
      }

      const kmlText = await kmlFile.async('text');
      const parser = new DOMParser();
      const kmlDom = parser.parseFromString(kmlText, 'text/xml');
      
      const geoJson = kml(kmlDom);

      if (!geoJson.features || geoJson.features.length === 0) {
        throw new Error('O arquivo KML não contém dados geográficos (features) válidos para conversão.');
      }

      setGeoJsonArea(geoJson);

    } catch (err: any) {
      setError(`Erro ao processar o arquivo: ${err.message}`);
      setGeoJsonArea(null);
      setFileName('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || cnaesSelecionados.length === 0 || !geoJsonArea) {
      setError('O nome da zona, a seleção de ao menos um CNAE e um arquivo KMZ válido são obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const novaZona = {
        nome,
        descricao,
        cnaesPermitidosIds: cnaesSelecionados,
        area: geoJsonArea, 
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
              <label htmlFor="kmz-upload">Arquivo de Área Geográfica (KMZ)</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="kmz-upload"
                  accept=".kmz"
                  onChange={handleFileChange}
                  required
                />
                <label htmlFor="kmz-upload" className="file-upload-label">
                  <i className="fas fa-upload"></i>
                  {fileName ? `Arquivo: ${fileName}` : 'Escolher arquivo KMZ'}
                </label>
              </div>
              {geoJsonArea && <p className="success-message">Arquivo processado com sucesso!</p>}
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
              {loading && !cnaesDisponiveis.length && <p>Carregando CNAEs...</p>}
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
              {loading ? 'Processando...' : (<><i className="fas fa-save"></i> Salvar Zona</>)}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}