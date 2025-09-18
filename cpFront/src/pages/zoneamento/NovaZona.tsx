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
    fetchCnaes()
      .then(data => setCnaesDisponiveis(data))
      .catch((err: any) => setError(err.message || 'Falha ao carregar a lista de CNAEs.'));
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
      cnae.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
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
        throw new Error('O arquivo KML não contém dados geográficos válidos.');
      }

      setGeoJsonArea(geoJson);

    } catch (err: any) {
      setError(`Erro ao processar o arquivo: ${err.message}`);
      setGeoJsonArea(null);
      setFileName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      setError('O nome da zona é obrigatório.');
      return;
    }
    if (cnaesSelecionados.length === 0) {
      setError('É necessário selecionar ao menos um CNAE.');
      return;
    }
    if (!geoJsonArea) {
      setError('É obrigatório enviar um arquivo KMZ válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createZoneamento({
        nome,
        descricao,
        cnaesPermitidosIds: cnaesSelecionados,
        area: geoJsonArea,
      });
      navigate('/zoneamento');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a nova zona. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sigum-zona-form-container">
      <header className="sigum-zona-form-header">
        <h1><i className="fas fa-plus-circle"></i> Cadastrar Nova Zona</h1>
        <button onClick={() => navigate('/zoneamento')} className="sigum-zona-form-btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </header>

      <main className="sigum-zona-form-main">
        <form onSubmit={handleSubmit} className="sigum-zona-form-body">
          <div className="sigum-zona-form-card">
            <h3><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h3>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="nome">Nome da Zona</label>
              <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Zona Comercial Central" required />
            </div>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Área destinada a comércios e serviços" rows={4}></textarea>
            </div>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="kmz-upload">Área Geográfica (KMZ)</label>
              <div className="sigum-zona-form-file-upload-wrapper">
                <input type="file" id="kmz-upload" accept=".kmz" onChange={handleFileChange} required />
                <label htmlFor="kmz-upload" className="sigum-zona-form-file-upload-label">
                  <i className={`fas ${geoJsonArea ? 'fa-check-circle' : 'fa-upload'}`}></i>
                  <span>{fileName || 'Escolher arquivo KMZ'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="sigum-zona-form-card">
            <h3><i className="fas fa-tasks"></i> Atividades Permitidas (CNAE)</h3>
            <div className="sigum-zona-form-cnae-search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Buscar por código ou descrição do CNAE..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </div>
            <div className="sigum-zona-form-cnae-list">
              {cnaesDisponiveis.length === 0 && !loading && <p>Carregando CNAEs...</p>}
              {cnaesFiltrados.length === 0 && termoBusca && <p>Nenhum CNAE encontrado.</p>}
              {cnaesFiltrados.map(cnae => (
                <div key={cnae.id} className="sigum-zona-form-cnae-item">
                  <input type="checkbox" id={`cnae-${cnae.id}`} checked={cnaesSelecionados.includes(cnae.id)} onChange={() => handleCnaeChange(cnae.id)} />
                  <label htmlFor={`cnae-${cnae.id}`} title={cnae.descricao}>
                    <strong>{cnae.codigo}</strong> - {cnae.descricao}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="sigum-zona-form-error-message">{error}</p>}

          <div className="sigum-zona-form-actions">
            <button type="button" onClick={() => navigate('/zoneamento')} className="sigum-zona-form-btn-cancelar">
              Cancelar
            </button>
            <button type="submit" className="sigum-zona-form-btn-salvar" disabled={loading}>
              {loading ? <span className="sigum-zona-form-spinner"></span> : <><i className="fas fa-save"></i> Salvar Zona</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}