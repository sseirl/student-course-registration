const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const createManager = async () => {
    const email = 'manager@example.com';
    const password = 'manager123';
    const full_name = 'Manager User';
    
    try {
        const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log('Менеджер уже существует');
            process.exit();
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await db.run(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES (?, ?, ?, 'manager')`,
            [email, hashedPassword, full_name]
        );
        
        console.log('Менеджер создан:');
        console.log('Email: manager@example.com');
        console.log('Пароль: manager123');
        
    } catch (err) {
        console.error('Ошибка:', err);
    }
    
    process.exit();
};

createManager();