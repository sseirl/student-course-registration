import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
    const [coursesWithRequests, setCoursesWithRequests] = useState([]);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get('/enrollments/pending');
            const enrollments = res.data;

            // Группируем заявки по курсам
            const grouped = enrollments.reduce((acc, enrollment) => {
                const courseId = enrollment.course_id;
                if (!acc[courseId]) {
                    acc[courseId] = {
                        course_id: courseId,
                        course_title: enrollment.title,
                        enrollments: []
                    };
                }
                acc[courseId].enrollments.push(enrollment);
                return acc;
            }, {});
            setCoursesWithRequests(Object.values(grouped));
        } catch (err) {
            console.error('Ошибка загрузки заявок:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (enrollmentId) => {
        try {
            await api.patch(`/enrollments/${enrollmentId}/approve`);
            fetchPendingRequests(); // обновляем список
        } catch (err) {
            alert('Ошибка при одобрении: ' + err.response?.data?.message);
        }
    };

    const handleReject = async (enrollmentId) => {
        if (!confirm('Отклонить заявку?')) return;
        try {
            await api.patch(`/enrollments/${enrollmentId}/reject`);
            fetchPendingRequests();
        } catch (err) {
            alert('Ошибка при отклонении: ' + err.response?.data?.message);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Загрузка заявок...</div>;

    if (coursesWithRequests.length === 0) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3>Нет заявок на рассмотрение</h3>
                <p>Все заявки обработаны.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2>Заявки на регистрацию</h2>
            <p style={{ color: '#6c7a8a', marginBottom: '2rem' }}>
                Здесь отображаются курсы, на которые есть новые заявки. Нажмите на курс, чтобы увидеть список студентов.
            </p>

            {coursesWithRequests.map(course => (
                <div key={course.course_id} style={{
                    marginBottom: '1.5rem',
                    border: '1px solid #eef2f6',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    <div
                        onClick={() => setExpandedCourseId(expandedCourseId === course.course_id ? null : course.course_id)}
                        style={{
                            backgroundColor: '#fff',
                            padding: '1rem 1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: expandedCourseId === course.course_id ? '1px solid #eef2f6' : 'none',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                        <div>
                            <h3 style={{ margin: 0 }}>{course.course_title}</h3>
                            <span style={{ fontSize: '0.85rem', color: '#e67e22' }}>
                                {course.enrollments.length} заявок на рассмотрении
                            </span>
                        </div>
                        <span style={{ fontSize: '1.2rem' }}>
                            {expandedCourseId === course.course_id ? '▲' : '▼'}
                        </span>
                    </div>

                    {expandedCourseId === course.course_id && (
                        <div style={{ backgroundColor: '#fefefe', padding: '1rem 1.5rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eef2f6' }}>Студент</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eef2f6' }}>Email</th>
                                        <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eef2f6' }}>Дата заявки</th>
                                        <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #eef2f6' }}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {course.enrollments.map(enrollment => (
                                        <tr key={enrollment.id}>
                                            <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f0f0f0' }}>{enrollment.full_name}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f0f0f0' }}>{enrollment.email}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f0f0f0' }}>{new Date(enrollment.requested_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleApprove(enrollment.id)}
                                                    className="btn-approve"
                                                    style={{
                                                        backgroundColor: '#27ae60',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        marginRight: '0.5rem',
                                                    }}
                                                >
                                                    Одобрить
                                                </button>
                                                <button
                                                    onClick={() => handleReject(enrollment.id)}
                                                    className="btn-reject"
                                                    style={{
                                                        backgroundColor: '#e74c3c',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Отклонить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ManagerDashboard;