const express = require('express');
const { authenticate } = require('../middlewares/auth');
const employeeController = require('../controllers/employeeController');

/*
 route for /api/employees
*/
const router = express.Router();

router.post('/', authenticate, employeeController.createEmployee);
router.get('/', authenticate, employeeController.listEmployees);
router.get('/:id', authenticate, employeeController.getEmployeeById);
router.put('/:id', authenticate, employeeController.updateEmployee);
router.delete('/:id', authenticate, employeeController.deleteEmployee);

module.exports = router;

