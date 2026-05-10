import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from '../components/common/Button';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!confirm(`Изменить роль на "${newRole}"?`)) return;
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            fetchUsers();
        } catch (err) {
            alert('Ошибка изменения роли');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Удалить пользователя? Все его записи тоже удалятся.')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Ошибка удаления');
        }
    };

    const getRoleLabel = (role) => {
        switch(role) {
            case 'admin': return 'Админ';
            case 'manager': return 'Менеджер';
            default: return 'Студент';
        }
    };

    const filteredUsers = users.filter(user => {
        if (filter === 'all') return true;
        return user.role === filter;
    });

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Загрузка...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Управление пользователями</h2>
            </div>

            {/* Фильтры */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eef2f6', paddingBottom: '1rem' }}>
                <button onClick={() => setFilter('all')} style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: filter === 'all' ? '#0a2942' : 'transparent',
                    color: filter === 'all' ? '#fff' : '#4a5b6e',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>Все ({users.length})</button>
                <button onClick={() => setFilter('admin')} style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: filter === 'admin' ? '#0a2942' : 'transparent',
                    color: filter === 'admin' ? '#fff' : '#4a5b6e',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>Админы ({users.filter(u => u.role === 'admin').length})</button>
                <button onClick={() => setFilter('manager')} style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: filter === 'manager' ? '#0a2942' : 'transparent',
                    color: filter === 'manager' ? '#fff' : '#4a5b6e',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>Менеджеры ({users.filter(u => u.role === 'manager').length})</button>
                <button onClick={() => setFilter('user')} style={{
                    padding: '0.5rem 1.5rem',
                    border: 'none',
                    background: filter === 'user' ? '#0a2942' : 'transparent',
                    color: filter === 'user' ? '#fff' : '#4a5b6e',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}>Студенты ({users.filter(u => u.role === 'user').length})</button>
            </div>

            {/* Список пользователей */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredUsers.map(user => (
                    <div key={user.id} style={{
                        backgroundColor: '#fff',
                        border: '1px solid #eef2f6',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <div>
                            <strong style={{ fontSize: '1rem' }}>{user.full_name}</strong>
                            <p style={{ fontSize: '0.85rem', color: '#6c7a8a', marginTop: '0.25rem' }}>{user.email}</p>
                            <p style={{ fontSize: '0.75rem', color: '#aaa' }}>ID: {user.id} | Регистрация: {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{
                                backgroundColor: user.role === 'admin' ? '#0a2942' : user.role === 'manager' ? '#e67e22' : '#6c7a8a',
                                color: '#fff',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem'
                            }}>
                                {getRoleLabel(user.role)}
                            </span>
                            
                            <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #ccc' }}
                                disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                            >
                                <option value="user">Студент</option>
                                <option value="manager">Менеджер</option>
                                <option value="admin">Админ</option>
                            </select>
                            
                            {user.role !== 'admin' && (
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        backgroundColor: '#fff',
                                        border: '1px solid #dc3545',
                                        borderRadius: '6px',
                                        color: '#dc3545',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Удалить
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsers;