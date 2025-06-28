const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../middleware/database');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').optional().trim().isLength({ min: 1 }),
  body('role').isIn(['mentor', 'mentee'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const db = getDatabase();
    
    db.run(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, name || email, role],
      function(err) {
        if (err) {
          db.close();
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        db.close();
        res.status(201).json({ message: 'User created successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    
    const { email, password } = req.body;
    const db = getDatabase();
    
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
          db.close();
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user);
        db.close();
        
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
