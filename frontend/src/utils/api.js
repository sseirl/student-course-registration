import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
//     headers: {
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//     }
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Добавляем random параметр чтобы избежать кэширования
        config.params = { ...config.params, _t: Date.now() };
        return config;
    },
    (error) => Promise.reject(error)
);

// Если токен протух или невалидный — выкидываем из системы
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;