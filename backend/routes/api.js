const express = require('express');
const multer = require('multer');
const { body, validationResult, query } = require('express-validator');
const { getDatabase } = require('../middleware/database');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for profile image upload
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 // 1MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
    }
  }
});

// Get current user info
router.get('/me', verifyToken, (req, res) => {
  const db = getDatabase();
  
  db.get(
    `SELECT id, email, role, name, bio, skills, image_type FROM users WHERE id = ?`,
    [req.user.sub],
    (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }
      
      const response = {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          name: user.name,
          bio: user.bio || '',
          imageUrl: user.image_type ? `/api/images/${user.role}/${user.id}` : 
                   (user.role === 'mentor' ? 
                    'https://placehold.co/500x500.jpg?text=MENTOR' : 
                    'https://placehold.co/500x500.jpg?text=MENTEE')
        }
      };
      
      if (user.role === 'mentor' && user.skills) {
        response.profile.skills = JSON.parse(user.skills);
      }
      
      db.close();
      res.json(response);
    }
  );
});

// Get profile image
router.get('/images/:role/:id', verifyToken, (req, res) => {
  const { role, id } = req.params;
  const db = getDatabase();
  
  db.get(
    `SELECT image_data, image_type FROM users WHERE id = ? AND role = ?`,
    [id, role],
    (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!user || !user.image_data) {
        db.close();
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.set('Content-Type', user.image_type);
      res.send(user.image_data);
      db.close();
    }
  );
});

// Update profile
router.put('/profile', verifyToken, [
  body('name').optional().trim(),
  body('bio').optional().trim(),
  body('image').optional().isString()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ error: 'Invalid input data' });
  }
  
  const { name, bio, skills, image } = req.body;
  const userId = req.user.sub;
  const userRole = req.user.role;
  
  console.log('Profile update request:', JSON.stringify(req.body, null, 2));
  
  // Reject role and id fields if provided
  if (req.body.hasOwnProperty('role')) {
    console.log('Rejecting request with role field');
    return res.status(400).json({ error: 'Role field cannot be modified' });
  }
  
  if (req.body.hasOwnProperty('id')) {
    console.log('Rejecting request with id field');
    return res.status(400).json({ error: 'ID field cannot be updated' });
  }
  
  // At least one field should be provided for update
  const hasValidUpdateFields = req.body.hasOwnProperty('name') || 
                               req.body.hasOwnProperty('bio') || 
                               req.body.hasOwnProperty('skills') || 
                               req.body.hasOwnProperty('image');
  
  if (!hasValidUpdateFields) {
    return res.status(400).json({ error: 'At least one field must be provided for update' });
  }
  
  // Relaxed validation - allow most updates to go through
  const db = getDatabase();
  
  let updateFields = [];
  let updateValues = [];
  
  // Handle name field
  if (req.body.hasOwnProperty('name')) {
    updateFields.push('name = ?');
    updateValues.push(name || ''); // Allow empty name
  }
  
  // Handle bio field
  if (req.body.hasOwnProperty('bio')) {
    updateFields.push('bio = ?');
    updateValues.push(bio !== undefined ? bio : ''); // Allow null/undefined bio
  }
  
  // Handle skills field (for mentors only)
  if (req.body.hasOwnProperty('skills') && userRole === 'mentor') {
    updateFields.push('skills = ?');
    updateValues.push(JSON.stringify(skills || [])); // Allow empty skills array
  }
  
  // Handle image field
  if (req.body.hasOwnProperty('image') && image) {
    try {
      const imageBuffer = Buffer.from(image, 'base64');
      const imageType = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      
      updateFields.push('image_data = ?', 'image_type = ?');
      updateValues.push(imageBuffer, imageType);
    } catch (err) {
      db.close();
      return res.status(400).json({ error: 'Invalid image data' });
    }
  }
  
  // Always allow the update even if no meaningful changes
  if (updateFields.length === 0) {
    // Just update the timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
  } else {
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
  }
  updateValues.push(userId);
  
  const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(sql, updateValues, function(err) {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Return updated user data
    db.get(
      `SELECT id, email, role, name, bio, skills, image_type FROM users WHERE id = ?`,
      [userId],
      (err, user) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        const response = {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: {
            name: user.name,
            bio: user.bio || '',
            imageUrl: user.image_type ? `/api/images/${user.role}/${user.id}` : 
                     (user.role === 'mentor' ? 
                      'https://placehold.co/500x500.jpg?text=MENTOR' : 
                      'https://placehold.co/500x500.jpg?text=MENTEE')
          }
        };
        
        if (user.role === 'mentor' && user.skills) {
          response.profile.skills = JSON.parse(user.skills);
        }
        
        db.close();
        res.json(response);
      }
    );
  });
});

// Get mentors list (for mentees)
router.get('/mentors', verifyToken, (req, res) => {
  // Check role - only mentees can access this
  if (req.user.role === 'mentor') {
    return res.status(403).json({ error: 'Mentors cannot access mentor list' });
  }
  
  if (req.user.role !== 'mentee') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid query parameters' });
  }
  
  const { skill, order_by } = req.query;
  const db = getDatabase();
  
  let sql = `SELECT id, email, name, bio, skills, image_type FROM users WHERE role = 'mentor'`;
  let params = [];
  
  if (skill) {
    sql += ` AND skills LIKE ?`;
    params.push(`%"${skill}"%`);
  }
  
  // Add ordering
  if (order_by === 'name') {
    sql += ` ORDER BY name ASC`;
  } else if (order_by === 'skill') {
    sql += ` ORDER BY skills ASC`;
  } else {
    sql += ` ORDER BY id ASC`;
  }
  
  db.all(sql, params, (err, mentors) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const response = mentors.map(mentor => ({
      id: mentor.id,
      email: mentor.email,
      role: 'mentor',
      profile: {
        name: mentor.name,
        bio: mentor.bio || '',
        imageUrl: mentor.image_type ? `/api/images/mentor/${mentor.id}` : 
                 'https://placehold.co/500x500.jpg?text=MENTOR',
        skills: mentor.skills ? JSON.parse(mentor.skills) : []
      }
    }));
    
    db.close();
    res.json(response);
  });
});

// Send match request (mentee only)
router.post('/match-requests', verifyToken, [
  body('mentorId').isInt({ min: 1 }),
  body('message').optional().trim()
], (req, res) => {
  // Check role - only mentees can create match requests
  if (req.user.role === 'mentor') {
    return res.status(403).json({ error: 'Mentors cannot create match requests' });
  }
  
  if (req.user.role !== 'mentee') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check for missing required fields first
  if (!req.body.mentorId) {
    return res.status(400).json({ error: 'mentorId is required' });
  }

  // Validate mentorId type and value before express-validator
  const mentorIdValue = req.body.mentorId;
  if (typeof mentorIdValue === 'string' && isNaN(Number(mentorIdValue))) {
    return res.status(400).json({ error: 'Invalid mentorId format' });
  }
  
  if (mentorIdValue && (!Number.isInteger(Number(mentorIdValue)) || Number(mentorIdValue) <= 0)) {
    return res.status(400).json({ error: 'Invalid mentorId value' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const { mentorId, message } = req.body;
  const menteeId = req.user.sub;
  
  // Check for extremely long message
  if (message && message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }
  
  const db = getDatabase();
  
  if (!db) {
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Check if mentor exists and handle database errors properly
  db.get(
    `SELECT id FROM users WHERE id = ? AND role = 'mentor'`,
    [mentorId],
    (err, mentor) => {
      if (err) {
        console.error('Database error checking mentor:', err);
        db.close();
        return res.status(400).json({ error: 'Invalid mentorId or database error' });
      }
      
      if (!mentor) {
        db.close();
        return res.status(400).json({ error: 'Mentor not found' });
      }
      
      // Check for existing request
      db.get(
        `SELECT id FROM match_requests WHERE mentor_id = ? AND mentee_id = ? AND status = 'pending'`,
        [mentorId, menteeId],
        (err, existingRequest) => {
          if (err) {
            console.error('Database error checking existing request:', err);
            db.close();
            return res.status(400).json({ error: 'Database validation error' });
          }
          
          if (existingRequest) {
            db.close();
            return res.status(400).json({ error: 'Request already exists' });
          }
          
          // Create new request
          db.run(
            `INSERT INTO match_requests (mentor_id, mentee_id, message, status) VALUES (?, ?, ?, 'pending')`,
            [mentorId, menteeId, message || ''],
            function(err) {
              if (err) {
                console.error('Error creating match request:', err);
                db.close();
                // Return 400 for constraint violations or validation errors
                return res.status(400).json({ error: 'Failed to create match request' });
              }
              
              const response = {
                id: this.lastID,
                mentorId: mentorId,
                menteeId: menteeId,
                message: message || '',
                status: 'pending'
              };
              
              db.close();
              res.status(201).json(response);
            }
          );
        }
      );
    }
  );
});

// Get incoming requests (mentor only)
router.get('/match-requests/incoming', verifyToken, (req, res) => {
  // Check role - only mentors can access incoming requests
  if (req.user.role === 'mentee') {
    return res.status(403).json({ error: 'Mentees cannot access incoming requests' });
  }
  
  if (req.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const mentorId = req.user.sub;
  const db = getDatabase();
  
  db.all(
    `SELECT id, mentor_id, mentee_id, message, status FROM match_requests WHERE mentor_id = ? ORDER BY created_at DESC`,
    [mentorId],
    (err, requests) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const response = requests.map(req => ({
        id: req.id,
        mentorId: req.mentor_id,
        menteeId: req.mentee_id,
        message: req.message,
        status: req.status
      }));
      
      db.close();
      res.json(response);
    }
  );
});

// Get outgoing requests (mentee only)
router.get('/match-requests/outgoing', verifyToken, (req, res) => {
  // Check role - only mentees can access outgoing requests
  if (req.user.role === 'mentor') {
    return res.status(403).json({ error: 'Mentors cannot access outgoing requests' });
  }
  
  if (req.user.role !== 'mentee') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const menteeId = req.user.sub;
  const db = getDatabase();
  
  db.all(
    `SELECT id, mentor_id, mentee_id, status FROM match_requests WHERE mentee_id = ? ORDER BY created_at DESC`,
    [menteeId],
    (err, requests) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const response = requests.map(req => ({
        id: req.id,
        mentorId: req.mentor_id,
        menteeId: req.mentee_id,
        status: req.status
      }));
      
      db.close();
      res.json(response);
    }
  );
});

// Accept request (mentor only)
router.put('/match-requests/:id/accept', verifyToken, checkRole('mentor'), (req, res) => {
  const requestId = req.params.id;
  const mentorId = req.user.sub;
  const db = getDatabase();
  
  // Start transaction-like behavior
  db.serialize(() => {
    // Check if request exists and belongs to this mentor
    db.get(
      `SELECT * FROM match_requests WHERE id = ? AND mentor_id = ? AND status = 'pending'`,
      [requestId, mentorId],
      (err, request) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!request) {
          db.close();
          return res.status(404).json({ error: 'Request not found' });
        }
        
        // Accept this request
        db.run(
          `UPDATE match_requests SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [requestId],
          (err) => {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Internal server error' });
            }
            
            // Reject all other pending requests for this mentor
            db.run(
              `UPDATE match_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP 
               WHERE mentor_id = ? AND id != ? AND status = 'pending'`,
              [mentorId, requestId],
              (err) => {
                if (err) {
                  db.close();
                  return res.status(500).json({ error: 'Internal server error' });
                }
                
                const response = {
                  id: request.id,
                  mentorId: request.mentor_id,
                  menteeId: request.mentee_id,
                  message: request.message,
                  status: 'accepted'
                };
                
                db.close();
                res.json(response);
              }
            );
          }
        );
      }
    );
  });
});

// Reject request (mentor only)
router.put('/match-requests/:id/reject', verifyToken, checkRole('mentor'), (req, res) => {
  const requestId = req.params.id;
  const mentorId = req.user.sub;
  const db = getDatabase();
  
  db.get(
    `SELECT * FROM match_requests WHERE id = ? AND mentor_id = ? AND status = 'pending'`,
    [requestId, mentorId],
    (err, request) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!request) {
        db.close();
        return res.status(404).json({ error: 'Request not found' });
      }
      
      db.run(
        `UPDATE match_requests SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [requestId],
        (err) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          const response = {
            id: request.id,
            mentorId: request.mentor_id,
            menteeId: request.mentee_id,
            message: request.message,
            status: 'rejected'
          };
          
          db.close();
          res.json(response);
        }
      );
    }
  );
});

// Cancel/delete request (mentee only)
router.delete('/match-requests/:id', verifyToken, checkRole('mentee'), (req, res) => {
  const requestId = req.params.id;
  const menteeId = req.user.sub;
  
  // Basic validation - just ensure requestId exists
  if (!requestId) {
    return res.status(400).json({ error: 'Request ID is required' });
  }
  
  const db = getDatabase();
  
  if (!db) {
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  db.get(
    `SELECT * FROM match_requests WHERE id = ? AND mentee_id = ?`,
    [requestId, menteeId],
    (err, request) => {
      if (err) {
        console.error('Database error finding request:', err);
        db.close();
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!request) {
        db.close();
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Allow cancellation of any request that's not already cancelled
      // Don't block based on status (accept/reject can still be cancelled)
      
      db.run(
        `UPDATE match_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [requestId],
        (err) => {
          if (err) {
            console.error('Database error cancelling request:', err);
            db.close();
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          const response = {
            id: request.id,
            mentorId: request.mentor_id,
            menteeId: request.mentee_id,
            message: request.message,
            status: 'cancelled'
          };
          
          db.close();
          res.status(200).json(response);
        }
      );
    }
  );
});

module.exports = router;
