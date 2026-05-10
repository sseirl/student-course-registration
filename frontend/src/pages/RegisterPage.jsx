import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/common/Button';

// Фоновое изображение (можно поменять URL на свою картинку университета)
const bgImageUrl = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'; // классический кампус

const RegisterPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      backgroundImage: `linear-gradient(0deg, rgba(10,41,66,0.75), rgba(10,41,66,0.85)), url(${bgImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 30%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '28px',
        padding: '2rem 2rem 2.5rem',
        boxShadow: '0 25px 45px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.25rem', borderLeft: 'none' }}>Стань частью академии</h2>
          <p style={{ color: '#5b6e8c', fontSize: '0.9rem' }}>Заполни форму — и доступ к курсам открыт</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff0f0', borderLeft: '4px solid #e67e22', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Полное имя</label>
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #cad2db', borderRadius: '14px', fontSize: '0.95rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #cad2db', borderRadius: '14px' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Пароль</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #cad2db', borderRadius: '14px' }}
            />
          </div>

          <Button fullWidth disabled={loading} onClick={handleSubmit}>
            {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: '#e67e22', fontWeight: 500 }}>Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;