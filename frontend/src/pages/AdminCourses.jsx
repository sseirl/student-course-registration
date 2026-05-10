import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from '../components/common/Button';
import { COURSE_CATEGORIES } from '../utils/categories';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        credits: 3,
        max_capacity: 30,
        teacherIds: []
    });

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error('Ошибка:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data);
        } catch (err) {
            console.error('Ошибка загрузки учителей:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            alert('Название курса обязательно');
            return;
        }
        
        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse.id}`, formData);
                // Обновляем связи с учителями
                await api.post('/courses/attach-teachers', {
                    course_id: editingCourse.id,
                    teacher_ids: formData.teacherIds
                });
                alert('Курс обновлён');
            } else {
                const res = await api.post('/courses', formData);
                // Привязываем учителей к новому курсу
                if (formData.teacherIds.length > 0) {
                    await api.post('/courses/attach-teachers', {
                        course_id: res.data.id,
                        teacher_ids: formData.teacherIds
                    });
                }
                alert('Курс создан');
            }
            setShowForm(false);
            setEditingCourse(null);
            setFormData({ title: '', description: '', category: '', credits: 3, max_capacity: 30, teacherIds: [] });
            fetchCourses();
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data?.message || 'Что-то пошло не так'));
        }
    };

    const handleEdit = async (course) => {
        setEditingCourse(course);
        
        // Загружаем учителей этого курса
        try {
            const res = await api.get(`/teachers/course/${course.id}`);
            const teacherIds = res.data.map(t => t.id);
            
            setFormData({
                title: course.title,
                description: course.description || '',
                category: course.category || '',
                credits: course.credits,
                max_capacity: course.max_capacity,
                teacherIds: teacherIds
            });
        } catch (err) {
            console.error('Ошибка загрузки учителей курса:', err);
            setFormData({
                title: course.title,
                description: course.description || '',
                category: course.category || '',
                credits: course.credits,
                max_capacity: course.max_capacity,
                teacherIds: []
            });
        }
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить курс? Все записи на него тоже удалятся.')) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (err) {
            alert('Ошибка удаления');
        }
    };

    const handleToggleStatus = async (course) => {
        const newStatus = course.status === 'active' ? 'archived' : 'active';
        const action = newStatus === 'active' ? 'открыть' : 'закрыть';
        
        if (!confirm(`Вы уверены, что хотите ${action} курс "${course.title}"?`)) return;
        
        try {
            await api.put(`/courses/${course.id}`, { ...course, status: newStatus });
            fetchCourses();
        } catch (err) {
            alert('Ошибка изменения статуса');
        }
    };

    const handleTeacherChange = (teacherId) => {
        setFormData(prev => {
            const newIds = prev.teacherIds.includes(teacherId)
                ? prev.teacherIds.filter(id => id !== teacherId)
                : [...prev.teacherIds, teacherId];
            return { ...prev, teacherIds: newIds };
        });
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Загрузка...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Управление курсами</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditingCourse(null); setFormData({ title: '', description: '', category: '', credits: 3, max_capacity: 30, teacherIds: [] }); }}>
                    {showForm ? 'Отмена' : '+ Создать курс'}
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    border: '1px solid #eef2f6'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>{editingCourse ? 'Редактировать курс' : 'Новый курс'}</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Название курса *</label>
                        <input
                            placeholder="Например: React для начинающих"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Описание</label>
                        <textarea
                            placeholder="Краткое описание курса"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Категория</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value="">Выберите категорию</option>
                            {COURSE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Кредиты (ECTS)</label>
                            <input
                                type="number"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Максимум студентов</label>
                            <input
                                type="number"
                                value={formData.max_capacity}
                                onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Преподаватели</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {teachers.map(teacher => (
                                <label key={teacher.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: formData.teacherIds.includes(teacher.id) ? '#e67e22' : '#f0f4f9',
                                    color: formData.teacherIds.includes(teacher.id) ? '#fff' : '#333',
                                    borderRadius: '20px',
                                    cursor: 'pointer'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.teacherIds.includes(teacher.id)}
                                        onChange={() => handleTeacherChange(teacher.id)}
                                        style={{ display: 'none' }}
                                    />
                                    {teacher.full_name}
                                </label>
                            ))}
                        </div>
                        {teachers.length === 0 && (
                            <p style={{ color: '#999', fontSize: '0.85rem' }}>Нет добавленных преподавателей</p>
                        )}
                    </div>
                    
                    <Button type="submit">
                        {editingCourse ? 'Сохранить изменения' : 'Создать курс'}
                    </Button>
                </form>
            )}

            {/* Список курсов */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                        Нет созданных курсов
                    </div>
                ) : (
                    courses.map(course => {
                        const isClosed = course.status !== 'active';
                        return (
                            <div key={course.id} style={{
                                backgroundColor: '#fff',
                                border: '1px solid #eef2f6',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                opacity: isClosed ? 0.7 : 1
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <h3 style={{ margin: 0 }}>{course.title}</h3>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '20px',
                                            backgroundColor: isClosed ? '#ffebee' : '#e8f5e9',
                                            color: isClosed ? '#c62828' : '#2e7d32'
                                        }}>
                                            {isClosed ? 'Закрыт' : 'Открыт'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#6c7a8a', marginBottom: '0.5rem' }}>
                                        {course.description || 'Нет описания'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#aaa', flexWrap: 'wrap' }}>
                                        <span>📂 {COURSE_CATEGORIES.find(c => c.value === course.category)?.label || course.category || 'Без категории'}</span>
                                        <span>🎓 {course.credits} ECTS</span>
                                        <span>👥 {course.current_enrolled}/{course.max_capacity} мест</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button
                                        onClick={() => handleToggleStatus(course)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            backgroundColor: '#fff',
                                            border: `1px solid ${isClosed ? '#2e7d32' : '#e67e22'}`,
                                            borderRadius: '6px',
                                            color: isClosed ? '#2e7d32' : '#e67e22',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isClosed ? 'Открыть курс' : 'Закрыть курс'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(course)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            backgroundColor: '#fff',
                                            border: '1px solid #0a2942',
                                            borderRadius: '6px',
                                            color: '#0a2942',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
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
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminCourses;