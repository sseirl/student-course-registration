# Student Course Registration System

**Университетская платформа для регистрации студентов на курсы** с ролевой моделью (Admin, Manager, User).

---

## О проекте

Система позволяет:
- **Студентам** – просматривать курсы, записываться на них с выбором преподавателя, отслеживать статус заявки, заполнять профиль.
- **Менеджерам** – просматривать и одобрять/отклонять заявки на запись.
- **Администраторам** – управлять курсами (CRUD), пользователями и их ролями.

Проект выполнен в академическом стиле, с акцентом на чистоту интерфейса и удобство использования.

---

## Технологии

### Backend
- **Node.js + Express.js**
- **SQLite** (легковесная БД, можно заменить на PostgreSQL)
- **JWT** для аутентификации
- **bcryptjs** для хеширования паролей
- **CORS, Helmet** для безопасности

### Frontend
- **React + Vite**
- **Axios** для запросов
- **React Router DOM** для навигации
- **Контекст** для управления состоянием аутентификации
- **Кастомные стили** (минимализм, адаптив)


---

## Роли и права

| Роль | Доступ |
|------|--------|
| **Гость** | Просмотр курсов, поиск, регистрация, вход |
| **Студент** | Запись на курсы с выбором преподавателя, просмотр своих заявок, редактирование профиля (факультет, группа, телефон) |
| **Менеджер** | Просмотр заявок (группировка по курсам), одобрение/отклонение |
| **Администратор** | Всё + управление курсами (создание, редактирование, удаление, открыть/закрыть) + управление пользователями (смена ролей, удаление) |

---

## API Endpoints

| Метод | URL | Описание | Доступ |
|-------|-----|----------|--------|
| POST | `/api/auth/register` | Регистрация | Все |
| POST | `/api/auth/login` | Вход | Все |
| GET | `/api/courses` | Список курсов (фильтрация, поиск) | Все |
| GET | `/api/courses/:id` | Детали курса | Все |
| POST | `/api/courses` | Создать курс | Admin |
| PUT | `/api/courses/:id` | Обновить курс | Admin |
| DELETE | `/api/courses/:id` | Удалить курс | Admin |
| POST | `/api/enrollments` | Подать заявку на курс | Студент |
| GET | `/api/enrollments/me` | Мои заявки | Студент |
| DELETE | `/api/enrollments/:id` | Отменить заявку (pending) | Студент |
| GET | `/api/enrollments/pending` | Список pending заявок | Manager, Admin |
| PATCH | `/api/enrollments/:id/approve` | Одобрить заявку | Manager, Admin |
| PATCH | `/api/enrollments/:id/reject` | Отклонить заявку | Manager, Admin |
| GET | `/api/users/me` | Профиль текущего пользователя | Авторизованные |
| PUT | `/api/users/me` | Обновить профиль | Авторизованные |
| GET | `/api/users` | Список пользователей | Admin |
| PATCH | `/api/users/:id/role` | Изменить роль | Admin |
| GET | `/api/teachers` | Список преподавателей | Admin |
| GET | `/api/teachers/course/:courseId` | Преподаватели курса | Все |

---

## Запуск проекта

### 1. Клонировать репозиторий
```bash
git clone https://github.com/sseirl/student-course-registration.git
cd student-course-registration

## 2. Настройка бэкенда

 [`cd backend`](javascript:void(0))  
 [`npm install`](javascript:void(0))  
 [`cp .env.example .env`](javascript:void(0)) — создать .env с PORT=5000 и JWT_SECRET  
 [`npm run dev`](javascript:void(0))

 Бэкенд запустится на [http://localhost:5000]

---

## 3. Настройка фронтенда

 [`cd frontend`](javascript:void(0))  
 [`npm install`](javascript:void(0))  
 [`npm run dev`](javascript:void(0))

Фронтенд запустится на [http://localhost:5173]

---

## 4. Тестовые данные

[`node seed-teachers.js`](javascript:void(0))  
[`node seed-course-teachers.js`](javascript:void(0))

## Структура проекта
student-course-registration/
├── backend/
│ ├── src/
│ │ ├── config/db.js # Подключение SQLite
│ │ ├── controllers/ # Логика обработки запросов
│ │ ├── middleware/ # auth.js, roles.js
│ │ ├── routes/ # auth, courses, enrollments, users, teachers
│ │ └── server.js
│ ├── .env # PORT, JWT_SECRET
│ └── database.sqlite # файл БД
├── frontend/
│ ├── src/
│ │ ├── components/Layout/ # Header, Layout
│ │ ├── pages/ # Homepage, Login, Register, CoursesList, CourseDetail, Profile, MyEnrollments, ManagerDashboard, AdminCourses, AdminUsers
│ │ ├── context/AuthContext.jsx # JWT токен, логин, логаут
│ │ └── utils/api.js # Axios инстанс с перехватчиками
│ └── package.json
└── README.md

### Учётные записи по умолчанию:

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | [admin@example.com](mailto:admin@example.com) | `admin123` |
| Manager | [manager@example.com](mailto:manager@example.com) | `manager123` |

---

## Команда и роли

🔵 [**Фронтенд – Айнуру**](javascript:void(0))  
🔵 [**Бэкенд – Самара**](javascript:void(0))
