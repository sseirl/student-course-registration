import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const Profile = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        faculty: '',
        group_name: '',
        year_of_study: '',
        phone: '',
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile({
                full_name: res.data.full_name || '',
                email: res.data.email || '',
                faculty: res.data.faculty || '',
                group_name: res.data.group_name || '',
                year_of_study: res.data.year_of_study || '',
                phone: res.data.phone || '',
            });
        } catch (err) {
            console.error('Ошибка загрузки профиля:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/me', profile);
            if (profile.full_name !== user?.full_name) {
                login({ ...user, full_name: profile.full_name }, localStorage.getItem('token'));
            }
            setEditing(false);
            alert('Профиль успешно обновлён');
        } catch (err) {
            alert('Ошибка обновления: ' + (err.response?.data?.message || 'Попробуйте позже'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
            <div>Загрузка профиля...</div>
        </div>
    );

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden',
            }}>
                {/* Шапка профиля с аватаркой */}
                <div style={{
                    background: 'linear-gradient(135deg, #0a2942 0%, #1e4a76 100%)',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#fff',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2.5rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}>
                        👨‍🎓
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff' }}>{profile.full_name}</h2>
                    <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>{profile.email}</p>
                </div>

                {/* Тело профиля */}
                <div style={{ padding: '2rem' }}>
                    {!editing ? (
                        // Режим просмотра
                        <div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem',
                            }}>
                                <InfoField icon="🏛️" label="Факультет" value={profile.faculty || 'Не указан'} />
                                <InfoField icon="👥" label="Группа" value={profile.group_name || 'Не указана'} />
                                <InfoField icon="📚" label="Курс обучения" value={profile.year_of_study ? `${profile.year_of_study} курс` : 'Не указан'} />
                                <InfoField icon="📞" label="Телефон" value={profile.phone || 'Не указан'} />
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <Button onClick={() => setEditing(true)}>Редактировать профиль</Button>
                            </div>
                        </div>
                    ) : (
                        // Режим редактирования
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Полное имя</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    style={{ ...inputStyle, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                />
                                <small style={{ color: '#6c7a8a' }}>Email нельзя изменить</small>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Факультет</label>
                                    <input type="text" name="faculty" value={profile.faculty} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Группа</label>
                                    <input type="text" name="group_name" value={profile.group_name} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Курс обучения</label>
                                    <input type="number" name="year_of_study" value={profile.year_of_study} onChange={handleChange} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Телефон</label>
                                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Отмена</Button>
                                <Button type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить изменения'}</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Вспомогательный компонент для отображения поля в режиме просмотра
const InfoField = ({ icon, label, value }) => (
    <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        padding: '1rem',
        border: '1px solid #eef2f6',
    }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontWeight: 600, color: '#0a2942', marginBottom: '0.25rem' }}>{label}</div>
        <div style={{ color: '#4a5b6e' }}>{value}</div>
    </div>
);

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
};

export default Profile;