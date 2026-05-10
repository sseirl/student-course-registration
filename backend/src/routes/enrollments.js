const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const allowRoles = require('../middleware/roles');

// Студент: записаться на курс
router.post('/', auth, enrollmentController.enrollCourse);

// Студент: посмотреть свои записи
router.get('/me', auth, enrollmentController.getMyEnrollments);

// Студент: отменить заявку (если pending)
router.delete('/:id', auth, enrollmentController.cancelEnrollment);

// Менеджер/Админ: посмотреть все pending заявки
router.get('/pending', auth, allowRoles('manager', 'admin'), enrollmentController.getPendingEnrollments);

// Менеджер/Админ: одобрить заявку
router.patch('/:id/approve', auth, allowRoles('manager', 'admin'), enrollmentController.approveEnrollment);

// Менеджер/Админ: отклонить заявку
router.patch('/:id/reject', auth, allowRoles('manager', 'admin'), enrollmentController.rejectEnrollment);

module.exports = router;