import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchZoneamentoById, updateZoneamento, deleteZoneamento } from '../../services/zoneamento';
import { fetchCnaes } from '../../services/cnaes';
import './NovaZona.css';
import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

type Cnae = {
  id: number;
  codigo: string;
  descricao: string;
};

// Tipagem para GeoJSON
type GeoJsonGeometry = {
  type: string;
  coordinates: any[];
};

type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry;
  properties: Record<string, any>;
};

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
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
  const [formLoading, setFormLoading] = useState(false);

  const [geoJsonArea, setGeoJsonArea] = useState<GeoJsonFeatureCollection | GeoJsonGeometry | null>(null);
  const [geoJsonOriginal, setGeoJsonOriginal] = useState<GeoJsonFeatureCollection | GeoJsonGeometry | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const zoneId = Number(id);
    if (isNaN(zoneId)) {
      setError('ID da zona inválido.');
      setLoading(false);
      return;
    }

    Promise.all([fetchZoneamentoById(zoneId), fetchCnaes()])
      .then(([zonaData, cnaesData]) => {
        setNome(zonaData.nome);
        setDescricao(zonaData.descricao);
        setCnaesSelecionados(zonaData.cnaesPermitidos.map(cnae => cnae.id));
        setCnaesDisponiveis(cnaesData);

        if (zonaData.area) {
          setGeoJsonArea(zonaData.area);
          setGeoJsonOriginal(zonaData.area);
          setFileName('Área existente. Envie um novo arquivo para substituir.');
        }
      })
      .catch(() => setError('Falha ao carregar os dados da zona ou a lista de CNAEs.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCnaeChange = (cnaeId: number) => {
    setCnaesSelecionados(prev =>
      prev.includes(cnaeId) ? prev.filter(id => id !== cnaeId) : [...prev, cnaeId]
    );
  };

  const cnaesFiltrados = useMemo(() => {
    if (!termoBusca) return cnaesDisponiveis;
    return cnaesDisponiveis.filter(cnae =>
      cnae.codigo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      cnae.descricao.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [termoBusca, cnaesDisponiveis]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    try {
      const zip = await JSZip.loadAsync(file);
      const kmlFile = Object.values(zip.files).find(f => f.name.toLowerCase().endsWith('.kml'));
      if (!kmlFile) throw new Error('Nenhum arquivo .kml foi encontrado no .kmz.');
      const kmlText = await kmlFile.async('text');
      const kmlDom = new DOMParser().parseFromString(kmlText, 'text/xml');
      const geoJson = kml(kmlDom);

      if (!geoJson.features || geoJson.features.length === 0) 
        throw new Error('O arquivo KML não contém dados geográficos válidos.');

      setGeoJsonArea(geoJson as GeoJsonFeatureCollection);
    } catch (err: any) {
      setError(`Erro ao processar o arquivo: ${err.message}`);
      setGeoJsonArea(null);
      setFileName('');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    let areaParaSalvar: GeoJsonFeatureCollection;

    if (geoJsonArea || geoJsonOriginal) {
      const geo = geoJsonArea || geoJsonOriginal;
      // Se for geometria simples, transforma em FeatureCollection
      if ((geo as GeoJsonFeatureCollection).type === 'FeatureCollection') {
        areaParaSalvar = geo as GeoJsonFeatureCollection;
      } else {
        areaParaSalvar = {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: geo as GeoJsonGeometry, properties: {} }]
        };
      }
    } else {
      setError('O nome da zona, um CNAE e uma área geográfica são obrigatórios.');
      return;
    }

    if (!nome || cnaesSelecionados.length === 0) {
      setError('O nome da zona e pelo menos um CNAE são obrigatórios.');
      return;
    }

    setFormLoading(true);
    setError(null);

    try {
      await updateZoneamento(Number(id), {
        nome,
        descricao,
        cnaesPermitidosIds: cnaesSelecionados,
        area: areaParaSalvar,
      });
      navigate('/zoneamento');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a zona.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir a zona "${nome}"? Esta ação não pode ser desfeita.`)) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteZoneamento(Number(id));
        navigate('/zoneamento');
      } catch {
        setError('Erro ao excluir a zona.');
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (loading) return <div className="sigum-zona-form-container"><p>Carregando dados da zona...</p></div>;

  return (
    <div className="sigum-zona-form-container">
      <header className="sigum-zona-form-header">
        <h1><i className="fas fa-edit"></i> Editar Zona</h1>
        <button onClick={() => navigate('/zoneamento')} className="sigum-zona-form-btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar à Lista
        </button>
      </header>

      <main className="sigum-zona-form-main">
        <form onSubmit={handleUpdate} className="sigum-zona-form-body">
          <div className="sigum-zona-form-card">
            <h3><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h3>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="nome">Nome da Zona</label>
              <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4}></textarea>
            </div>
            <div className="sigum-zona-form-input-group">
              <label htmlFor="kmz-upload">Área Geográfica (KMZ)</label>
              <div className="sigum-zona-form-file-upload-wrapper">
                <input type="file" id="kmz-upload" accept=".kmz" onChange={handleFileChange} />
                <label htmlFor="kmz-upload" className="sigum-zona-form-file-upload-label">
                  <i className={`fas ${(geoJsonArea || geoJsonOriginal) ? 'fa-check-circle' : 'fa-upload'}`}></i>
                  <span>{fileName || 'Escolher arquivo KMZ'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="sigum-zona-form-card">
            <h3><i className="fas fa-tasks"></i> Atividades Permitidas (CNAE)</h3>
            <div className="sigum-zona-form-cnae-search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Buscar por código ou descrição..." value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
            </div>
            <div className="sigum-zona-form-cnae-list">
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

          <div className="sigum-zona-form-actions-edit">
            <button type="button" onClick={handleDelete} className="sigum-zona-form-btn-excluir" disabled={formLoading}>
              <i className="fas fa-trash-alt"></i> Excluir Zona
            </button>
            <div className="sigum-zona-form-actions-right">
              <button type="button" onClick={() => navigate('/zoneamento')} className="sigum-zona-form-btn-cancelar">Cancelar</button>
              <button type="submit" className="sigum-zona-form-btn-salvar" disabled={formLoading}>
                {formLoading ? <span className="sigum-zona-form-spinner"></span> : <><i className="fas fa-save"></i> Salvar Alterações</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
