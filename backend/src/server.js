const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const userRoutes = require('./routes/users');
const teacherRoutes = require('./routes/teachers');

const app = express();

// Расширенная настройка CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(helmet());
app.use(express.json());

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер запущен' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер слушает порт ${PORT}`);
});