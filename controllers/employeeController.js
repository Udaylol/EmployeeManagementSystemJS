const Employee = require('../models/Employee');

async function createEmployee(req, res) {
  try {
    const { firstName, lastName, email, role, salary } = req.body;
    if (!firstName || !lastName || !email || !role || salary == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Employee with this email already exists' });
    }
    const employee = await Employee.create({ firstName, lastName, email, role, salary });
    return res.status(201).json(employee);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listEmployees(req, res) {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json(employees);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Not found' });
    return res.json(employee);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid id' });
  }
}

async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, salary } = req.body;
    const updated = await Employee.findByIdAndUpdate(
      id,
      { firstName, lastName, email, role, salary },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid data or id' });
  }
}

async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid id' });
  }
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};


