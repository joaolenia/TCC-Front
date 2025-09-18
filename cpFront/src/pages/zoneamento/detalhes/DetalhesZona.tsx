// src/pages/zoneamento/detalhes/DetalhesZona.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchZoneamentoById } from '../../../services/zoneamento';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DetalhesZona.css';
import '../../details/Details.css'; // Importação para reuso de estilos

type Zona = {
    id: number;
    nome: string;
    descricao: string;
    area?: any;
    cnaesPermitidos: { id: number; codigo: string; descricao: string }[];
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

    return (
        <div className="container">
             <header className="top-header">
               <h1><i className="fas fa-map-marked-alt"></i> Detalhes da Zona</h1>
             </header>
             <nav className="nav-actions">
               <button onClick={() => navigate('/zoneamento')} className="btn-voltar">
                   <i className="fas fa-arrow-left"></i> Voltar à Lista de Zonas
               </button>
             </nav>

            <main className="details-layout">
                <section className="info-card">
                  <h3><i className="fas fa-info-circle"></i> Informações da Zona</h3>
                  <div className="details-list">
                    <div className="item">
                        <span className="item-label">Nome da Zona</span>
                        <span className="item-value">{zona.nome}</span>
                    </div>
                    <div className="item">
                        <span className="item-label">Descrição</span>
                        <span className="item-value long-text">{zona.descricao}</span>
                    </div>
                  </div>
                </section>

                <section className="info-card">
                  <h3><i className="fas fa-tasks"></i> Atividades Permitidas (CNAEs)</h3>
                  <div className="tags-container">
                      {zona.cnaesPermitidos.length > 0 ? (
                        zona.cnaesPermitidos.map(cnae => (
                          <span key={cnae.id} className="tag" title={cnae.descricao}>{cnae.codigo}</span>
                        ))
                      ) : (
                        <p>Nenhuma atividade permitida para esta zona.</p>
                      )}
                  </div>
                </section>

                <section className="info-card map-card">
                    <h3><i className="fas fa-globe-americas"></i> Visualização Geográfica</h3>
                    {zona.area ? (
                        <MapContainer scrollWheelZoom={true} className="map-container">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <GeoJSON data={zona.area} style={{ color: "#0056b3", weight: 2 }} />
                            <FitBounds geoJsonData={zona.area} />
                        </MapContainer>
                    ) : (
                        <p className="item-value">Nenhuma área geográfica cadastrada para esta zona.</p>
                    )}
                </section>
            </main>
        </div>
    );
}