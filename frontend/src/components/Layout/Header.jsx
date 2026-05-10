import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #eef2f6',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(0px)',
        }}>
            <div className="container" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                height: '70px',
            }}>
                {/* Логотип */}
                <Link to="/" style={{ 
                    fontSize: '1.6rem', 
                    fontWeight: 700, 
                    letterSpacing: '-0.5px', 
                    color: '#0a2942',
                    textDecoration: 'none',
                }}>
                    Uni<span style={{ color: '#e67e22' }}>Reg</span>
                </Link>

                {/* Навигация */}
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <NavLink to="/" isActive={isActive('/')}>Главная</NavLink>
                    
                    {(!isAuthenticated || user?.role !== 'admin') && (
                        <NavLink to="/courses" isActive={isActive('/courses')}>Курсы</NavLink>
                    )}
                    
                    {isAuthenticated && user?.role === 'user' && (
                        <>
                            <NavLink to="/my-enrollments" isActive={isActive('/my-enrollments')}>Мои курсы</NavLink>
                            <NavLink to="/profile" isActive={isActive('/profile')}>Профиль</NavLink>
                        </>
                    )}
                    
                    {isAuthenticated && (user?.role === 'manager' || user?.role === 'admin') && (
                        <NavLink to="/manager/enrollments" isActive={isActive('/manager/enrollments')}>Заявки</NavLink>
                    )}
                    
                    {isAuthenticated && user?.role === 'admin' && (
                        <>
                            <NavLink to="/admin/courses" isActive={isActive('/admin/courses')}>Управление курсами</NavLink>
                            <NavLink to="/admin/users" isActive={isActive('/admin/users')}>Пользователи</NavLink>
                        </>
                    )}
                </nav>

                {/* Профиль / кнопки входа */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: '#f8fafc',
                                padding: '0.4rem 1rem',
                                borderRadius: '40px',
                                fontSize: '0.9rem',
                                color: '#0a2942',
                            }}>
                                <span style={{ fontWeight: 500 }}>{user?.full_name}</span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    backgroundColor: user?.role === 'admin' ? '#0a2942' : user?.role === 'manager' ? '#e67e22' : '#6c7a8a',
                                    color: '#fff',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '20px',
                                }}>
                                    {user?.role === 'admin' ? 'Админ' : user?.role === 'manager' ? 'Менеджер' : 'Студент'}
                                </span>
                            </div>
                            <Button variant="outline" onClick={logout} style={{ padding: '0.4rem 1.2rem' }}>Выйти</Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => navigate('/login')}>Войти</Button>
                            <Button onClick={() => navigate('/register')}>Регистрация</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

// Компонент для стилизованной ссылки без подчёркивания
const NavLink = ({ to, children, isActive }) => {
    return (
        <Link
            to={to}
            style={{
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                color: isActive ? '#e67e22' : '#2c3e50',
                transition: 'color 0.2s, transform 0.1s',
                padding: '0.4rem 0',
                borderBottom: isActive ? '2px solid #e67e22' : 'none',
            }}
            onMouseEnter={(e) => {
                if (!isActive) e.target.style.color = '#e67e22';
            }}
            onMouseLeave={(e) => {
                if (!isActive) e.target.style.color = '#2c3e50';
            }}
        >
            {children}
        </Link>
    );
};

export default Header;