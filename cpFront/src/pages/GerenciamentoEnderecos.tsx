
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GerenciamentoEnderecos.css'; // Novo arquivo de estilo

type Endereco = {
  id: number;
  logradouro: string;
  bairro: string;
  cep: string;
  cidade: string;
};

// --- DADOS MOCADOS ---
const enderecosMocados: Endereco[] = [
  { id: 1, logradouro: 'Rua da Inovação', bairro: 'Centro', cep: '89500-001', cidade: 'Cruz Machado' },
  { id: 2, logradouro: 'Avenida das Araucárias, 1250', bairro: 'Jardim das Flores', cep: '89500-002', cidade: 'Cruz Machado' },
  { id: 3, logradouro: 'Rua dos Pinheiros, 300', bairro: 'Vila Nova', cep: '89500-003', cidade: 'Cruz Machado' },
  { id: 4, logradouro: 'Travessa das Palmeiras, 42', bairro: 'Centro', cep: '89500-004', cidade: 'Cruz Machado' },
];
// --- FIM DOS DADOS MOCADOS ---

export default function GerenciamentoEnderecos() {
  const { id: zonaId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [nomeZona, setNomeZona] = useState('');
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    // Simula a busca de dados da API
    console.log(`Buscando endereços para a Zona ID: ${zonaId}`);
    // Aqui você faria a chamada à API passando o zonaId.
    // Por enquanto, usamos os dados mocados.
    
    // Poderia-se buscar o nome da zona também. Ex:
    // fetchZonaById(zonaId).then(data => setNomeZona(data.nome));
    setNomeZona('Zona Comercial Central'); // Nome mocado
    setEnderecos(enderecosMocados);
    setLoading(false);
  }, [zonaId]);

  const enderecosFiltrados = useMemo(() => {
    if (!termoBusca) {
      return enderecos;
    }
    return enderecos.filter(end =>
      end.logradouro.toLowerCase().includes(termoBusca.toLowerCase()) ||
      end.bairro.toLowerCase().includes(termoBusca.toLowerCase()) ||
      end.cep.replace('-', '').includes(termoBusca.replace('-', ''))
    );
  }, [termoBusca, enderecos]);

  if (loading) return <div className="container">Carregando endereços...</div>;

  return (
    <div className="container">
      <header className="top-header">
        <h1>
          <i className="fas fa-map-marker-alt" style={{ color: 'var(--cor-primaria)' }}></i>{' '}
          Endereços da "{nomeZona}"
        </h1>
      </header>

      <nav className="nav-actions">
        <button onClick={() => navigate('/zoneamento')} className="btn-voltar">
          <i className="fas fa-arrow-left"></i> Voltar para Zonas
        </button>
        <div className="toolbar-direita">
            <div className="search-bar-enderecos">
                <i className="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Buscar por rua, bairro ou CEP..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                />
            </div>
            <button className="btn-novo-endereco">
                <i className="fas fa-plus"></i> Cadastrar Endereço
            </button>
        </div>
      </nav>

      <main className="enderecos-grid">
        {enderecosFiltrados.map((endereco) => (
          <div key={endereco.id} className="endereco-card">
            <div className="endereco-card-icone">
              <i className="fas fa-road"></i>
            </div>
            <div className="endereco-card-info">
              <h4>{endereco.logradouro}</h4>
              <p>{endereco.bairro}, {endereco.cidade}</p>
              <span>CEP: {endereco.cep}</span>
            </div>
            <div className="endereco-card-acoes">
              <button className="btn-editar-endereco" title="Editar Endereço">
                <i className="fas fa-pencil-alt"></i>
              </button>
            </div>
          </div>
        ))}
         {enderecosFiltrados.length === 0 && !loading && (
            <div className="nenhum-resultado">Nenhum endereço encontrado.</div>
        )}
      </main>
    </div>
  );
}