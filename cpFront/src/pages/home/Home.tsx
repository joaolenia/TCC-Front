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
    const [userLogin, setUserLogin] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            setUserLogin(parsedUser.email);
            setUserRole(parsedUser.role);
        }

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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

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
        <div className="sigum-home-page-container">
            <header className="sigum-home-header">
                <div className="sigum-home-header-title">
                    <h1>Painel de Consultas</h1>
                    <p>Visão geral das solicitações de viabilidade</p>
                </div>
                <div className="sigum-home-user-profile">
                    <div className="sigum-home-user-info">
                        <span className="sigum-home-user-name">{userLogin}</span>
                        <span className="sigum-home-user-role">{userRole}</span>
                    </div>
                    <button onClick={handleLogout} className="sigum-home-logout-button" title="Sair">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </header>

            <section className="sigum-home-stats-panel">
                <div className={`sigum-home-stat-card total ${filtroSituacao === 'TODAS' ? 'active' : ''}`} onClick={() => setFiltroSituacao('TODAS')}>
                    <div className="sigum-home-stat-icon"><i className="fas fa-layer-group"></i></div>
                    <div className="sigum-home-stat-info">
                        <h3>Total de Solicitações</h3>
                        <p>{estatisticas.total}</p>
                    </div>
                </div>
                <div className={`sigum-home-stat-card aprovadas ${filtroSituacao === 'DEFERIDO' ? 'active' : ''}`} onClick={() => setFiltroSituacao('DEFERIDO')}>
                    <div className="sigum-home-stat-icon"><i className="fas fa-check-circle"></i></div>
                    <div className="sigum-home-stat-info">
                        <h3>Consultas Deferidas</h3>
                        <p>{estatisticas.deferidas}</p>
                    </div>
                </div>
                <div className={`sigum-home-stat-card rejeitadas ${filtroSituacao === 'INDEFERIDO' ? 'active' : ''}`} onClick={() => setFiltroSituacao('INDEFERIDO')}>
                     <div className="sigum-home-stat-icon"><i className="fas fa-times-circle"></i></div>
                    <div className="sigum-home-stat-info">
                        <h3>Consultas Indeferidas</h3>
                        <p>{estatisticas.indeferidas}</p>
                    </div>
                </div>
            </section>

            <div className="sigum-home-toolbar">
                <div className="sigum-home-search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Pesquisar por protocolo, solicitante ou endereço..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                    />
                </div>
                {userRole === 'ADMIN' && (
                    <div className="sigum-home-admin-actions">
                        <button className="sigum-home-action-button" onClick={() => navigate('/zoneamento')}>
                            <i className="fas fa-map-marked-alt"></i> Gerenciar Zoneamento
                        </button>
                        <button className="sigum-home-action-button" onClick={() => navigate('/cnaes')}>
                            <i className="fas fa-briefcase"></i> Gerenciar CNAEs
                        </button>
                    </div>
                )}
            </div>

            <main className="sigum-home-consultas-grid">
                {loading && <p className="sigum-home-loading-message">Carregando consultas...</p>}
                {error && <p className="sigum-home-error-message">{error}</p>}
                {!loading && !error && consultasFiltradas.map((consulta) => (
                    <div key={consulta.id} className="sigum-home-consulta-card">
                        <div className="sigum-home-card-header">
                            <span className="sigum-home-protocolo">Protocolo: {consulta.co_protocolo_redesim}</span>
                            <span className={`sigum-home-status-tag ${consulta.situacao.toLowerCase()}`}>
                                {consulta.situacao}
                            </span>
                        </div>
                        <div className="sigum-home-card-body">
                            <h4>{consulta.nome_solicitante}</h4>
                            <div className="sigum-home-info-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{consulta.endereco}</span>
                            </div>
                            <div className="sigum-home-info-item">
                                <i className="fas fa-briefcase"></i>
                                <span>{consulta.cnaes.join(', ')}</span>
                            </div>
                        </div>
                        <div className="sigum-home-card-footer">
                            <span className="sigum-home-data"><i className="far fa-calendar-alt"></i> {formatarData(consulta.dt_solicitacao)}</span>
                            <button className="sigum-home-btn-detalhes" onClick={() => navigate(`/detalhes/${consulta.id}`)}>
                                Ver Detalhes <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && consultasFiltradas.length === 0 && <p className="sigum-home-no-results">Nenhuma consulta encontrada para os filtros aplicados.</p>}
            </main>
        </div>
    );
}