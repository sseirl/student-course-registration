import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/common/Button';

const Homepage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ courses: 0, teachers: 0, students: 0 });
    const [latestCourses, setLatestCourses] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchLatestCourses();
    }, []);

    const fetchStats = async () => {
        try {
            const coursesRes = await api.get('/courses');
            const teachersRes = await api.get('/teachers');
            // Для количества студентов можно сделать отдельный запрос, но пока заглушка
            setStats({
                courses: coursesRes.data.length,
                teachers: teachersRes.data.length,
                students: 1250, // демо-цифра, позже можно заменить на реальный запрос
            });
        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
        }
    };

    const fetchLatestCourses = async () => {
        try {
            const res = await api.get('/courses?status=active&_limit=3');
            // Берём первые 3 активных курса (сортировка по умолчанию по id/created_at)
            const courses = res.data.slice(0, 3);
            setLatestCourses(courses);
        } catch (err) {
            console.error('Ошибка загрузки курсов:', err);
        }
    };

    return (
        <>
           

            {/* Статистика */}
            {/* Hero секция с фоном */}
<section style={{
    backgroundImage: `linear-gradient(rgba(10, 41, 66, 0.85), rgba(10, 41, 66, 0.85)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '6rem 0',
    color: '#fff',
    textAlign: 'center',
}}>
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#fff' }}>
            Добро пожаловать в <span style={{ color: '#e67e22' }}>UniReg</span>
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Централизованная платформа для записи на курсы. Присоединяйтесь к академическому сообществу.
        </p>
        {!isAuthenticated ? (
            <Button onClick={() => navigate('/register')}>Начать обучение</Button>
        ) : (
            <p style={{ fontSize: '1.1rem' }}>С возвращением, <strong>{user?.full_name}</strong>!</p>
        )}
    </div>
</section>

            {/* О нас */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <h2 style={{ textAlign: 'center' }}>Почему выбирают нас</h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        marginTop: '2rem',
                    }}>
                        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eef2f6' }}>
                            <h3>🎓 Качество образования</h3>
                            <p>Программы разработаны ведущими специалистами и соответствуют международным стандартам.</p>
                        </div>
                        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eef2f6' }}>
                            <h3>💻 Современные технологии</h3>
                            <p>Интерактивные платформы, онлайн-лекции и практические проекты.</p>
                        </div>
                        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eef2f6' }}>
                            <h3>🚀 Карьерный рост</h3>
                            <p>Стажировки, помощь в трудоустройстве и партнёрство с компаниями.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Последние курсы */}
            {latestCourses.length > 0 && (
                <section style={{ backgroundColor: '#fff', padding: '4rem 0' }}>
                    <div className="container">
                        <h2 style={{ textAlign: 'center' }}>Популярные курсы</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginTop: '2rem',
                        }}>
                            {latestCourses.map(course => (
                                <div key={course.id} style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid #eef2f6',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onClick={() => navigate(`/courses/${course.id}`)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <h3 style={{ marginBottom: '0.5rem' }}>{course.title}</h3>
                                    <p style={{ color: '#6c7a8a', fontSize: '0.9rem' }}>{course.description?.substring(0, 80)}...</p>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{course.credits} ECTS</span>
                                        <span style={{ color: '#e67e22' }}>Подробнее →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Button variant="outline" onClick={() => navigate('/courses')}>Все курсы</Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Призыв к действию */}
            {!isAuthenticated && (
                <section style={{ backgroundColor: '#0a2942', color: '#fff', padding: '3rem 0', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Готовы начать обучение?</h2>
                        <p style={{ marginBottom: '2rem' }}>Зарегистрируйтесь и получите доступ к лучшим курсам.</p>
                        <Button onClick={() => navigate('/register')}>Регистрация</Button>
                    </div>
                </section>
            )}
        </>
    );
};

export default Homepage;