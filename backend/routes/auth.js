const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../middleware/database');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Signup
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('role').isIn(['mentor', 'mentee']).withMessage('Role must be mentor or mentee')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }
    
    const { email, password, name, role } = req.body;
    
    // Check for missing required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const db = getDatabase();
    
    // First check if email already exists
    db.get(
      `SELECT id FROM users WHERE email = ?`,
      [email],
      (err, existingUser) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (existingUser) {
          db.close();
          return res.status(400).json({ error: 'Email already exists' });
        }
        
        // Insert new user
        db.run(
          `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
          [email, hashedPassword, name, role],
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
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { email, password } = req.body;
    
    // Check for missing fields
    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
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
