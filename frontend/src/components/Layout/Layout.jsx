import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <footer style={{
                borderTop: '1px solid #eef2f6',
                padding: '2rem 0',
                marginTop: '3rem',
                backgroundColor: '#fafcfc',
                color: '#6c7a8a',
                fontSize: '0.85rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    © 2025 University Registration System — академическая платформа
                </div>
            </footer>
        </div>
    );
};

export default Layout;