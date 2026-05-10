import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { COURSE_CATEGORIES } from '../utils/categories';

const CoursesList = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchCourses();
        fetchEnrollmentStatuses();
    }, [search, category]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            // Показываем все курсы (и открытые, и закрытые)
            let url = '/courses';
            if (search) url += `?search=${search}`;
            if (category) url += `${search ? '&' : '?'}category=${category}`;
            
            const res = await api.get(url);
            setCourses(res.data);
        } catch (err) {
            console.error('Ошибка загрузки курсов:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollmentStatuses = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await api.get('/enrollments/me');
            const statusMap = {};
            res.data.forEach(e => {
                statusMap[e.course_id] = e.status;
            });
            setEnrollmentStatuses(statusMap);
        } catch (err) {
            console.error('Ошибка загрузки статусов:', err);
        }
    };

    const handleEnroll = async (e, courseId) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert('Нужно войти в систему');
            return;
        }
        
        try {
            await api.post('/enrollments', { course_id: courseId });
            alert('Заявка отправлена! Ждите одобрения менеджера.');
            fetchEnrollmentStatuses();
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Вы уже записаны на этот курс') {
                alert('Вы уже подавали заявку на этот курс');
            } else {
                alert('Ошибка: ' + (msg || 'Не удалось записаться'));
            }
        }
    };

    const getCategoryLabel = (categoryValue) => {
        const cat = COURSE_CATEGORIES.find(c => c.value === categoryValue);
        return cat ? cat.label : categoryValue || 'Без категории';
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                Загрузка курсов...
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2>Все курсы</h2>
            <p style={{ color: '#6c7a8a', marginBottom: '2rem' }}>
                Выберите интересующий курс. Закрытые курсы доступны только для просмотра.
            </p>
            
            {/* Поиск и фильтр */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #eef2f6'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Поиск по названию или описанию..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 2,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#e67e22'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="">Все категории</option>
                    {COURSE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => { setSearch(''); setCategory(''); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#f0f0f0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                >
                    Сбросить
                </button>
            </div>
            
            {/* Список курсов */}
            {courses.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px'
                }}>
                    <p>Курсы не найдены</p>
                    <button
                        onClick={() => { setSearch(''); setCategory(''); }}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#e67e22',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Показать все курсы
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {courses.map(course => {
                        // Проверка статуса курса
                        const isClosed = course.status !== 'active';
                        const userStatus = enrollmentStatuses[course.id];
                        const isEnrolled = userStatus === 'approved';
                        const isPending = userStatus === 'pending';
                        
                        return (
                            <div 
                                key={course.id} 
                                onClick={() => !isClosed && navigate(`/courses/${course.id}`)}
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    border: '1px solid #eef2f6',
                                    transition: 'all 0.25s ease',
                                    cursor: isClosed ? 'not-allowed' : 'pointer',
                                    opacity: isClosed ? 0.75 : 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isClosed) {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                        e.currentTarget.style.borderColor = '#e67e22';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#eef2f6';
                                }}
                            >
                                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        backgroundColor: '#f0f4f9',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        color: '#0a2942',
                                        fontWeight: 500
                                    }}>
                                        {getCategoryLabel(course.category)}
                                    </span>
                                    {isClosed && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            backgroundColor: '#ffebee',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            color: '#c62828'
                                        }}>
                                            Закрыт
                                        </span>
                                    )}
                                </div>
                                
                                <h3 style={{ 
                                    fontSize: '1.35rem', 
                                    marginBottom: '0.75rem',
                                    color: '#0a2942'
                                }}>
                                    {course.title}
                                </h3>
                                
                                <p style={{ 
                                    color: '#4a5b6e', 
                                    fontSize: '0.9rem', 
                                    marginBottom: '1.25rem',
                                    flex: 1
                                }}>
                                    {course.description?.substring(0, 100)}
                                    {course.description?.length > 100 ? '...' : ''}
                                </p>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderTop: '1px solid #edf2f7',
                                    paddingTop: '1rem',
                                    marginTop: 'auto'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600, color: '#0a2942' }}>
                                            🎓 {course.credits} ECTS
                                        </span>
                                        <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6c7a8a' }}>
                                            👥 {course.current_enrolled}/{course.max_capacity}
                                        </span>
                                    </div>
                                    
                                    {/* Кнопка или статус в зависимости от состояния */}
                                    {isClosed ? (
                                        <span style={{ color: '#c62828', fontSize: '0.8rem' }}>Курс закрыт</span>
                                    ) : isEnrolled ? (
                                        <span style={{ color: '#2e7d32', fontSize: '0.8rem' }}>Зачислен</span>
                                    ) : isPending ? (
                                        <span style={{ color: '#e67e22', fontSize: '0.8rem' }}>На рассмотрении</span>
                                    ) : (
                                        <Button variant="outline" onClick={(e) => handleEnroll(e, course.id)}>
                                            Записаться
                                        </Button>
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

export default CoursesList;