const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

// Доступно всем (даже без авторизации)
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Только для админа
router.post('/', auth, allowRoles('admin'), courseController.createCourse);
router.put('/:id', auth, allowRoles('admin'), courseController.updateCourse);
router.delete('/:id', auth, allowRoles('admin'), courseController.deleteCourse);

// Новый маршрут: привязка преподавателей к курсу (только админ)
router.post('/attach-teachers', auth, allowRoles('admin'), courseController.attachTeachers);

module.exports = router;