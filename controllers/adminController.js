const Admin = require('../models/Admin');

async function createAdmin(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Admin with this username already exists' });
    }
    const admin = await Admin.create({ username, password });
    const adminResponse = await Admin.findById(admin._id).select('-password');
    return res.status(201).json(adminResponse);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function listAdmins(req, res) {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    return res.json(admins);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getAdminById(req, res) {
  try {
    const id = req.params.id;
    const admin = await Admin.findById(id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    return res.json(admin);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid id' });
  }
}

async function updateAdmin(req, res) {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    
    const updated = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ message: 'Admin not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid data or id' });
  }
}

async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Admin not found' });
    return res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid id' });
  }
}

module.exports = {
  createAdmin,
  listAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin
};
