import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MyEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyEnrollments();
    }, []);

    const fetchMyEnrollments = async () => {
        try {
            const res = await api.get('/enrollments/me');
            setEnrollments(res.data);
        } catch (err) {
            console.error('Ошибка загрузки записей:', err);
        } finally {
            setLoading(false);
        }
    };

    const cancelEnrollment = async (id) => {
        if (!confirm('Отменить заявку на курс?')) return;
        
        try {
            await api.delete(`/enrollments/${id}`);
            fetchMyEnrollments(); // обновляем список
        } catch (err) {
            alert('Ошибка отмены: ' + (err.response?.data?.message || 'Попробуйте позже'));
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved':
                return { text: 'Зачислен', color: '#2e7d32', bg: '#e8f5e9' };
            case 'rejected':
                return { text: 'Отклонён', color: '#c62828', bg: '#ffebee' };
            default:
                return { text: 'На рассмотрении', color: '#e67e22', bg: '#fff3e0' };
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Загрузка...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2>Мои записи на курсы</h2>
            <p style={{ color: '#6c7a8a', marginBottom: '2rem' }}>
                {user?.full_name}, здесь отображаются все твои заявки
            </p>

            {enrollments.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px'
                }}>
                    <p>Вы ещё не записаны ни на один курс</p>
                    <a href="/courses" style={{ color: '#e67e22' }}>Перейти к курсам</a>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {enrollments.map(enrollment => {
                        const badge = getStatusBadge(enrollment.status);
                        return (
                            <div key={enrollment.id} style={{
                                backgroundColor: '#fff',
                                border: '1px solid #eef2f6',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '0.25rem' }}>{enrollment.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#6c7a8a', marginBottom: '0.5rem' }}>
                                        {enrollment.description?.substring(0, 100)}...
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
                                        <span>Кредиты: {enrollment.credits} ECTS</span>
                                        <span>Заявка от: {new Date(enrollment.requested_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        backgroundColor: badge.bg,
                                        color: badge.color,
                                        marginBottom: '0.5rem'
                                    }}>
                                        {badge.text}
                                    </span>
                                    <br />
                                    {enrollment.status === 'pending' && (
                                        <button
                                            onClick={() => cancelEnrollment(enrollment.id)}
                                            style={{
                                                marginTop: '0.5rem',
                                                padding: '0.4rem 1rem',
                                                backgroundColor: '#fff',
                                                border: '1px solid #dc3545',
                                                borderRadius: '6px',
                                                color: '#dc3545',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Отменить
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyEnrollments;