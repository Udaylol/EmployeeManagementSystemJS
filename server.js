const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { authenticate, signAuthToken } = require('./middlewares/auth');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/Admin');
const app = express();
const port = 3000;

// User
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bee_project';
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
  
app.use(express.static(path.join(__dirname, 'public')));

// Serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ message: 'Username and password required.' });
  }
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return res.json({ message: 'Invalid username or password.' });
    }
    const token = signAuthToken({ id: admin._id, username: admin.username });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000
    });
    return res.json({ message: 'Login successful!' });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.json({ message: 'An error occurred. Please try again.' });
  }
});

// Home page route (protected)
app.get('/home', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
});

// Employee CRUD routes (protected)
app.use('/api/employees', employeeRoutes);
// Admin CRUD routes (protected)
app.use('/api/admins', adminRoutes);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
