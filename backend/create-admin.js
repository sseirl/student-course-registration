const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const createAdmin = async () => {
    const email = 'admin@example.com';
    const password = 'admin123';
    const full_name = 'Admin User';
    
    try {
        // Проверяем, есть ли уже админ
        const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log('Админ уже существует');
            process.exit();
            return;
        }
        
        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Создаём админа (role = 'admin')
        await db.run(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES (?, ?, ?, 'admin')`,
            [email, hashedPassword, full_name]
        );
        
        console.log('Админ создан:');
        console.log('Email: admin@example.com');
        console.log('Пароль: admin123');
        
    } catch (err) {
        console.error('Ошибка:', err);
    }
    
    process.exit();
};

createAdmin();