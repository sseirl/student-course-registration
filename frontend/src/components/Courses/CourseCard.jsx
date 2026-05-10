import React from 'react';
import Button from '../common/Button';

const CourseCard = ({ course, onEnroll }) => {
  return (
    <div className="course-card" style={{
      backgroundColor: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      transition: 'all 0.2s',
      border: '1px solid #eef2f6',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          backgroundColor: '#f0f4f9',
          padding: '0.2rem 0.6rem',
          borderRadius: '20px',
          color: '#0a2942',
          fontWeight: 500,
        }}>
          {course.category || 'Course'}
        </span>
      </div>
      <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{course.title}</h3>
      <p style={{ color: '#4a5b6e', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
        {course.description?.substring(0, 100)}...
      </p>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid #edf2f7',
        paddingTop: '1rem',
        marginTop: '0.5rem',
      }}>
        <div>
          <span style={{ fontWeight: 600, color: '#0a2942' }}>{course.credits} ECTS</span>
          <span style={{ marginLeft: '1rem', fontSize: '0.8rem', color: '#6c7a8a' }}>
            🎓 {course.current_enrolled}/{course.max_capacity}
          </span>
        </div>
        <Button variant="outline" onClick={() => onEnroll(course)}>Записаться</Button>
      </div>
    </div>
  );
};

export default CourseCard;