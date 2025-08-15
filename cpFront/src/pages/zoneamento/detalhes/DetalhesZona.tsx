import { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { fetchZoneamentoById } from '../../../services/zoneamento';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'; 
import L, {  } from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import './DetalhesZona.css';

type Zona = {
    id: number;
    nome: string;
    descricao: string;
    area?: any;
    cnaesPermitidos: { id: number; codigo: string; descricao: string }[];
};

const calcularCentroide = (geoJson: any): [number, number] => {
    if (
        !geoJson || !geoJson.features || !Array.isArray(geoJson.features) ||
        geoJson.features.length === 0 || !geoJson.features[0].geometry ||
        !geoJson.features[0].geometry.coordinates ||
        !Array.isArray(geoJson.features[0].geometry.coordinates[0]) ||
        geoJson.features[0].geometry.coordinates[0].length === 0
    ) {
        return [-26.08, -51.33];
    }
    const coords = geoJson.features[0].geometry.coordinates[0];
    let latSum = 0;
    let lonSum = 0;
    coords.forEach((ponto: [number, number]) => {
        if (Array.isArray(ponto) && ponto.length >= 2) {
            lonSum += ponto[0];
            latSum += ponto[1];
        }
    });
    const count = coords.length;
    if (count === 0) {
        return [-26.08, -51.33];
    }
    return [latSum / count, lonSum / count];
};

function FitBounds({ geoJsonData }: { geoJsonData: any }) {
    const map = useMap();
    useEffect(() => {
        if (geoJsonData) {
            const geoJsonLayer = L.geoJSON(geoJsonData);
            const bounds = geoJsonLayer.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds);
            }
        }
    }, [geoJsonData, map]);
    return null; 
}

export default function DetalhesZona() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [zona, setZona] = useState<Zona | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const zoneId = Number(id);
        if (!zoneId) {
            setError('ID de zona inválido.');
            setLoading(false);
            return;
        }
        fetchZoneamentoById(zoneId)
            .then(setZona)
            .catch(() => setError('Não foi possível carregar os dados da zona.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container-feedback"><h1>Carregando...</h1></div>;
    if (error) return <div className="container-feedback error"><h1>Erro:</h1><p>{error}</p></div>;
    if (!zona) return <div className="container-feedback"><h1>Zona não encontrada.</h1></div>;

    const centroMapa = calcularCentroide(zona.area);

    return (
        <div className="container">
             <header className="top-header">
               <h1><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h1>
             </header>
             <nav className="nav-actions">
               <button onClick={() => navigate('/zoneamento')} className="btn-voltar">
                   <i className="fas fa-arrow-left"></i> Voltar 
                   
               </button>
             </nav>


            <main className="details-zona-layout">
                <div className="info-card">
                  <h3>{zona.nome}</h3>
                  <p className="zona-descricao">{zona.descricao}</p>
                  <h4>Atividades Permitidas (CNAEs)</h4>
                  <div className="tags-container">
                      {zona.cnaesPermitidos.map(cnae => (
                          <span key={cnae.id} className="tag" title={cnae.descricao}>{cnae.codigo}</span>
                      ))}
                  </div>
                </div>

                <div className="map-card">
                    <h3>Visualização Geográfica</h3>
                    {zona.area ? (
                        <MapContainer scrollWheelZoom={true} className="map-container">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <GeoJSON data={zona.area} />
                            <FitBounds geoJsonData={zona.area} />
                        </MapContainer>
                    ) : (
                        <p>Nenhuma área geográfica cadastrada para esta zona.</p>
                    )}
                </div>
            </main>
        </div>
    );
}