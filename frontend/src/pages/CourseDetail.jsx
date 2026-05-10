import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { COURSE_CATEGORIES } from '../utils/categories';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [course, setCourse] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);

    useEffect(() => {
        fetchCourse();
        fetchTeachers();
        checkEnrollmentStatus();
    }, [id]);

    const fetchCourse = async () => {
        try {
            const res = await api.get(`/courses/${id}`);
            setCourse(res.data);
        } catch (err) {
            console.error('Ошибка загрузки курса:', err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get(`/teachers/course/${id}`);
            setTeachers(res.data);
            if (res.data.length > 0) {
                setSelectedTeacher(res.data[0].id);
            }
        } catch (err) {
            console.error('Ошибка загрузки преподавателей:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollmentStatus = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.get('/enrollments/me');
            const existing = res.data.find(e => e.course_id === parseInt(id));
            if (existing) {
                setEnrollmentStatus(existing.status);
            }
        } catch (err) {
            console.error('Ошибка проверки статуса:', err);
        }
    };

    const handleEnroll = async () => {
        if (!selectedTeacher) {
            alert('Пожалуйста, выберите преподавателя');
            return;
        }

        setEnrolling(true);
        try {
            await api.post('/enrollments', { 
                course_id: parseInt(id), 
                teacher_id: selectedTeacher 
            });
            alert('Заявка отправлена! Ожидайте одобрения менеджера.');
            setEnrollmentStatus('pending');
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Вы уже записаны на этот курс') {
                alert('Вы уже подавали заявку на этот курс');
            } else {
                alert('Ошибка: ' + (msg || 'Не удалось записаться'));
            }
        } finally {
            setEnrolling(false);
        }
    };

    const getCategoryLabel = (categoryValue) => {
        const cat = COURSE_CATEGORIES.find(c => c.value === categoryValue);
        return cat ? cat.label : categoryValue || 'Без категории';
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                Загрузка...
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                Курс не найден
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <button 
                onClick={() => navigate('/courses')} 
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#e67e22',
                    cursor: 'pointer',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                ← Назад к курсам
            </button>

            <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid #eef2f6',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                <h1 style={{ marginBottom: '0.75rem', color: '#0a2942' }}>{course.title}</h1>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <span style={{
                        backgroundColor: '#f0f4f9',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#0a2942'
                    }}>
                        {getCategoryLabel(course.category)}
                    </span>
                    <span style={{
                        backgroundColor: '#f0f4f9',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#0a2942'
                    }}>
                        {course.credits} ECTS
                    </span>
                    <span style={{
                        backgroundColor: course.status === 'active' ? '#e8f5e9' : '#ffebee',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: course.status === 'active' ? '#2e7d32' : '#c62828'
                    }}>
                        {course.status === 'active' ? 'Курс открыт' : 'Курс закрыт'}
                    </span>
                </div>

                <h3 style={{ marginBottom: '0.75rem', color: '#0a2942' }}>О курсе</h3>
                <p style={{ color: '#4a5b6e', lineHeight: '1.6', marginBottom: '2rem' }}>
                    {course.description || 'Описание отсутствует'}
                </p>

                <h3 style={{ marginBottom: '1rem', color: '#0a2942' }}>Преподаватели</h3>
                {teachers.length === 0 ? (
                    <p style={{ color: '#999', marginBottom: '2rem' }}>Преподаватели будут назначены позже</p>
                ) : (
                    <div style={{ marginBottom: '2rem' }}>
                        {teachers.map(teacher => (
                            <label 
                                key={teacher.id} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    padding: '1rem',
                                    backgroundColor: selectedTeacher === teacher.id ? '#fff3e0' : '#f8fafc',
                                    borderRadius: '12px',
                                    marginBottom: '0.75rem',
                                    cursor: 'pointer',
                                    border: selectedTeacher === teacher.id ? '1px solid #e67e22' : '1px solid #eef2f6',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="radio"
                                    name="teacher"
                                    value={teacher.id}
                                    checked={selectedTeacher === teacher.id}
                                    onChange={() => setSelectedTeacher(teacher.id)}
                                    disabled={enrollmentStatus === 'approved' || enrollmentStatus === 'pending' || course.status !== 'active'}
                                    style={{ marginTop: '0.25rem' }}
                                />
                                <div>
                                    <strong style={{ fontSize: '1rem', color: '#0a2942' }}>{teacher.full_name}</strong>
                                    <p style={{ fontSize: '0.85rem', color: '#6c7a8a', marginTop: '0.25rem' }}>
                                        {teacher.bio || 'Опытный преподаватель'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem' }}>
                                        📧 {teacher.email}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}

                <h3 style={{ marginBottom: '1rem', color: '#0a2942' }}>Информация о записи</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '1.25rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <div>
                        <span style={{ color: '#6c7a8a', fontSize: '0.85rem' }}>Свободных мест:</span>
                        <strong style={{ display: 'block', fontSize: '1.75rem', color: '#0a2942' }}>
                            {course.max_capacity - course.current_enrolled}
                        </strong>
                    </div>
                    <div>
                        <span style={{ color: '#6c7a8a', fontSize: '0.85rem' }}>Всего мест:</span>
                        <strong style={{ display: 'block', fontSize: '1.75rem', color: '#0a2942' }}>
                            {course.max_capacity}
                        </strong>
                    </div>
                    <div>
                        <span style={{ color: '#6c7a8a', fontSize: '0.85rem' }}>Уже записалось:</span>
                        <strong style={{ display: 'block', fontSize: '1.75rem', color: '#0a2942' }}>
                            {course.current_enrolled}
                        </strong>
                    </div>
                </div>

                {!isAuthenticated ? (
                    <Button onClick={() => navigate('/login')} fullWidth>
                        Войдите, чтобы записаться
                    </Button>
                ) : enrollmentStatus === 'approved' ? (
                    <div style={{ 
                        backgroundColor: '#e8f5e9', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        color: '#2e7d32',
                        textAlign: 'center'
                    }}>
                        Вы уже зачислены на этот курс!
                    </div>
                ) : enrollmentStatus === 'pending' ? (
                    <div style={{ 
                        backgroundColor: '#fff3e0', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        color: '#e67e22',
                        textAlign: 'center'
                    }}>
                        Ваша заявка на рассмотрении. Ожидайте одобрения.
                    </div>
                ) : course.status !== 'active' ? (
                    <div style={{ 
                        backgroundColor: '#ffebee', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        color: '#c62828',
                        textAlign: 'center'
                    }}>
                        Этот курс закрыт для записи
                    </div>
                ) : (
                    <Button onClick={handleEnroll} disabled={enrolling} fullWidth>
                        {enrolling ? 'Отправка...' : 'Записаться на курс'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;