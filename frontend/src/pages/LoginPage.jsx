import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/common/Button';

const bgImageUrl = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      backgroundImage: `linear-gradient(0deg, rgba(10,41,66,0.8), rgba(10,41,66,0.9)), url(${bgImageUrl})`,
      backgroundSize: 'cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '28px',
        padding: '2rem 2rem 2.2rem',
        margin: '1rem'
      }}>
        <h2 style={{ marginBottom: '0.25rem', borderLeft: 'none', textAlign: 'center' }}>Добро пожаловать</h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#6c7a8a' }}>Войди в свой учебный аккаунт</p>

        {error && <div style={{ backgroundColor: '#fff0f0', padding: '0.7rem', borderRadius: '12px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', borderRadius: '14px', border: '1px solid #ccc' }} />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: '1.5rem', padding: '0.8rem', borderRadius: '14px', border: '1px solid #ccc' }} />
          <Button fullWidth disabled={loading} onClick={handleSubmit}>{loading ? 'Вход...' : 'Войти'}</Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Нет аккаунта? <Link to="/register" style={{ color: '#e67e22' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;