import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await login({ login: email, senha: password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      navigate('/home');
    } catch (err) {
      setError('Credenciais inválidas. Por favor, verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sigum-login-page-container">
      <div className="sigum-login-branding-panel">
        <video autoPlay muted loop className="sigum-login-branding-video">
          <source src="https://cdn.coverr.co/videos/coverr-a-city-seen-from-above-at-night-4249/1080p.mp4" type="video/mp4" />
        </video>
        <div className="sigum-login-branding-overlay"></div>
        <div className="sigum-login-branding-content">
          <h1>SIGUM</h1>
          <p>Sistema Integrado de Gestão Urbana Municipal</p>
        </div>
      </div>

      <div className="sigum-login-form-container">
        <div className="sigum-login-card-wrapper">
          <div className="sigum-login-header">
            <h2>Bem-vindo de volta!</h2>
            <p>Acesse o painel com as suas credenciais.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="sigum-login-input-group-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
              <i className="fas fa-envelope sigum-login-input-icon"></i>
            </div>
            <div className="sigum-login-input-group-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Senha</label>
              <i className="fas fa-lock sigum-login-input-icon"></i>
            </div>

            {error && (
              <div className="sigum-login-error-message-box">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            
            <div className="sigum-login-actions">
              <a href="https://jgsolucoesemsoftware.com.br" target="_blank" rel="noopener noreferrer" className="sigum-login-forgot-password-link">
                Esqueceu a senha? (Suporte)
              </a>
            </div>

            <button type="submit" className="sigum-login-action-button" disabled={loading}>
              {loading ? <span className="sigum-login-spinner"></span> : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}