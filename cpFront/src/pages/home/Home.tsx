import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchConsultasPreviasResumo } from '../../services/cpv';
import type { ConsultaPreviaResumo } from '../../services/cpv';
import './Home.css';

type SituacaoFiltro = 'TODAS' | 'DEFERIDO' | 'INDEFERIDO';

export default function Home() {
    const navigate = useNavigate();
    const [consultas, setConsultas] = useState<ConsultaPreviaResumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroSituacao, setFiltroSituacao] = useState<SituacaoFiltro>('TODAS');
    const [termoBusca, setTermoBusca] = useState('');

    useEffect(() => {
        fetchConsultasPreviasResumo()
            .then(data => {
                setConsultas(data);
            })
            .catch(() => {
                setError('Não foi possível carregar as consultas. Tente novamente mais tarde.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const estatisticas = useMemo(() => {
        return {
            total: consultas.length,
            deferidas: consultas.filter(c => c.situacao === 'DEFERIDO').length,
            indeferidas: consultas.filter(c => c.situacao === 'INDEFERIDO').length,
        };
    }, [consultas]);

    const consultasFiltradas = useMemo(() => {
        return consultas.filter(consulta => {
            const correspondeFiltroStatus = filtroSituacao === 'TODAS' || consulta.situacao === filtroSituacao;
            
            const correspondeBusca = termoBusca.trim() === '' ||
                consulta.co_protocolo_redesim.toLowerCase().includes(termoBusca.toLowerCase()) ||
                consulta.nome_solicitante.toLowerCase().includes(termoBusca.toLowerCase()) ||
                consulta.endereco.toLowerCase().includes(termoBusca.toLowerCase());

            return correspondeFiltroStatus && correspondeBusca;
        });
    }, [consultas, filtroSituacao, termoBusca]);

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Painel de Consultas</h1>
                <div className="user-profile">
                    <span>Servidor Municipal</span>
                    <img src="https://i.pravatar.cc/150?img=12" alt="Foto do servidor" />
                </div>
            </header>

            <section className="stats-panel">
                <div className={`stat-card total ${filtroSituacao === 'TODAS' ? 'active' : ''}`} onClick={() => setFiltroSituacao('TODAS')}>
                    <h3>Total de Solicitações</h3>
                    <p>{estatisticas.total}</p>
                </div>
                <div className={`stat-card aprovadas ${filtroSituacao === 'DEFERIDO' ? 'active' : ''}`} onClick={() => setFiltroSituacao('DEFERIDO')}>
                    <h3>Consultas Deferidas</h3>
                    <p>{estatisticas.deferidas}</p>
                </div>
                <div className={`stat-card rejeitadas ${filtroSituacao === 'INDEFERIDO' ? 'active' : ''}`} onClick={() => setFiltroSituacao('INDEFERIDO')}>
                    <h3>Consultas Indeferidas</h3>
                    <p>{estatisticas.indeferidas}</p>
                </div>
            </section>

            <div className="toolbar">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Pesquisar por protocolo, solicitante ou endereço..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>
                <button
                    className="btn-nova-consulta"
                    onClick={() => navigate('/zoneamento')}
                >
                    <i className="fas fa-plus"></i> Gerenciar Zoneamento
                </button>
            </div>

            <main className="consultas-grid">
                {loading && <p>Carregando consultas...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && consultasFiltradas.map((consulta) => (
                    <div key={consulta.id} className="consulta-card">
                        <div className="card-header">
                            <span className="protocolo">Protocolo: {consulta.co_protocolo_redesim}</span>
                            <span className={`status-tag ${consulta.situacao === 'DEFERIDO' ? 'deferido' : 'indeferido'}`}>
                                {consulta.situacao}
                            </span>
                        </div>
                        <div className="card-body">
                            <h4>{consulta.nome_solicitante}</h4>
                            <div className="info-item">
                                <i className="fas fa-user-tie"></i>
                                <span>Solicitante: {consulta.nome_solicitante}</span>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>Endereço: {consulta.endereco}</span>
                            </div>
                            <div className="info-item">
                                <i className="fas fa-briefcase"></i>
                                <span>CNAEs: {consulta.cnaes.join(', ')}</span>
                            </div>
                            <div className="info-item situacao-destaque">
                                <i className="fas fa-info-circle"></i>
                                <span>Situação: {consulta.situacao}</span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="data">Recebido em: {formatarData(consulta.dt_solicitacao)}</span>
                            <button className="btn-detalhes"
                            onClick={() => navigate(`/detalhes/${consulta.id}`)}>Ver Detalhes</button>
                        </div>
                    </div>
                ))}
                {!loading && consultasFiltradas.length === 0 && <p>Nenhuma consulta encontrada para os filtros aplicados.</p>}
            </main>
        </div>
    );
}