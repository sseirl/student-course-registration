import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesList from './pages/CoursesList';
import MyEnrollments from './pages/MyEnrollments';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';

import CourseDetail from './pages/CourseDetail';

const RoleRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) return <div>Загрузка...</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user?.role)) return <Navigate to="/" />;
    
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Общие страницы */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses" element={<CoursesList />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            
            {/* Для студентов */}
            <Route path="/my-enrollments" element={
                <RoleRoute allowedRoles={['user', 'manager', 'admin']}>
                    <MyEnrollments />
                </RoleRoute>
            } />
            
            {/* Для менеджеров и админов */}
            <Route path="/manager/enrollments" element={
                <RoleRoute allowedRoles={['manager', 'admin']}>
                    <ManagerDashboard />
                </RoleRoute>
            } />
            
            {/* Только для админов */}
            <Route path="/admin/courses" element={
                <RoleRoute allowedRoles={['admin']}>
                    <AdminCourses />
                </RoleRoute>
            } />
            <Route path="/admin/users" element={
                <RoleRoute allowedRoles={['admin']}>
                    <AdminUsers />
                </RoleRoute>
            } />

            <Route path="/profile" element={
              <RoleRoute allowedRoles={['user', 'manager', 'admin']}>
                <Profile />
              </RoleRoute>
            } />

        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Layout>
                    <AppRoutes />
                </Layout>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;