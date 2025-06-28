const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mentor-mentee-secret-key-2024';

// Middleware to check if user is authenticated for web routes
function checkAuth(req, res, next) {
  const token = req.cookies?.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token is invalid, remove it
      res.clearCookie('token');
    }
  }
  next();
}

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  next();
}

// Middleware to require specific role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).render('error', { error: 'Access denied' });
    }
    next();
  };
}

// Enable cookie parsing
router.use(cookieParser());
router.use(checkAuth);

// Root route - redirect based on authentication
router.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/profile');
  } else {
    res.redirect('/login');
  }
});

// Signup page
router.get('/signup', (req, res) => {
  if (req.user) {
    return res.redirect('/profile');
  }
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      res.redirect('/login?signup=success');
    } else {
      const error = await response.json();
      res.render('signup', { error: error.error || 'Signup failed' });
    }
  } catch (err) {
    res.render('signup', { error: 'Server error' });
  }
});

// Login page
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/profile');
  }
  
  const success = req.query.signup === 'success';
  res.render('login', { error: null, success });
});

router.post('/login', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      const data = await response.json();
      res.cookie('token', data.token, { 
        httpOnly: true, 
        secure: false, // Set to true in production with HTTPS
        maxAge: 3600000 // 1 hour
      });
      res.redirect('/profile');
    } else {
      const error = await response.json();
      res.render('login', { 
        error: error.error || 'Login failed',
        success: false
      });
    }
  } catch (err) {
    res.render('login', { error: 'Server error', success: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Profile page
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/me', {
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      res.render('profile', { user, error: null, success: null });
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    res.render('error', { error: 'Failed to load profile' });
  }
});

router.post('/profile', requireAuth, async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (response.ok) {
      const user = await response.json();
      res.render('profile', { 
        user, 
        error: null, 
        success: 'Profile updated successfully!' 
      });
    } else {
      const error = await response.json();
      const userResponse = await fetch('http://localhost:8080/api/me', {
        headers: { 'Authorization': `Bearer ${req.cookies.token}` }
      });
      const user = await userResponse.json();
      
      res.render('profile', { 
        user, 
        error: error.error || 'Update failed',
        success: null
      });
    }
  } catch (err) {
    res.render('error', { error: 'Server error' });
  }
});

// Mentors page (mentee only)
router.get('/mentors', requireAuth, requireRole('mentee'), async (req, res) => {
  try {
    const queryParams = new URLSearchParams();
    if (req.query.skill) queryParams.append('skill', req.query.skill);
    if (req.query.order_by) queryParams.append('order_by', req.query.order_by);
    
    const response = await fetch(`http://localhost:8080/api/mentors?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    if (response.ok) {
      const mentors = await response.json();
      res.render('mentors', { 
        mentors, 
        searchSkill: req.query.skill || '',
        orderBy: req.query.order_by || '',
        error: null 
      });
    } else {
      res.render('mentors', { 
        mentors: [], 
        searchSkill: '',
        orderBy: '',
        error: 'Failed to load mentors' 
      });
    }
  } catch (err) {
    res.render('error', { error: 'Server error' });
  }
});

// Send match request
router.post('/mentors/:id/request', requireAuth, requireRole('mentee'), async (req, res) => {
  try {
    const response = await fetch('http://localhost:8080/api/match-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mentorId: parseInt(req.params.id),
        message: req.body.message
      })
    });
    
    if (response.ok) {
      res.redirect('/requests?success=Request sent successfully');
    } else {
      const error = await response.json();
      res.redirect(`/mentors?error=${encodeURIComponent(error.error || 'Request failed')}`);
    }
  } catch (err) {
    res.redirect('/mentors?error=Server error');
  }
});

// Requests page
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const endpoint = req.user.role === 'mentor' ? 'incoming' : 'outgoing';
    const response = await fetch(`http://localhost:8080/api/match-requests/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    if (response.ok) {
      const requests = await response.json();
      
      // For mentor incoming requests, get mentee details
      if (req.user.role === 'mentor' && requests.length > 0) {
        for (let request of requests) {
          try {
            const menteeResponse = await fetch(`http://localhost:8080/api/images/mentee/${request.menteeId}`, {
              headers: { 'Authorization': `Bearer ${req.cookies.token}` }
            });
            request.menteeImageUrl = menteeResponse.ok ? 
              `/api/images/mentee/${request.menteeId}` : 
              'https://placehold.co/500x500.jpg?text=MENTEE';
          } catch {
            request.menteeImageUrl = 'https://placehold.co/500x500.jpg?text=MENTEE';
          }
        }
      }
      
      res.render('requests', { 
        requests, 
        userRole: req.user.role,
        error: req.query.error || null,
        success: req.query.success || null
      });
    } else {
      res.render('requests', { 
        requests: [], 
        userRole: req.user.role,
        error: 'Failed to load requests',
        success: null
      });
    }
  } catch (err) {
    res.render('error', { error: 'Server error' });
  }
});

// Accept/reject requests (mentor only)
router.post('/requests/:id/:action', requireAuth, requireRole('mentor'), async (req, res) => {
  const { id, action } = req.params;
  
  if (!['accept', 'reject'].includes(action)) {
    return res.redirect('/requests?error=Invalid action');
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/match-requests/${id}/${action}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    if (response.ok) {
      res.redirect(`/requests?success=Request ${action}ed successfully`);
    } else {
      const error = await response.json();
      res.redirect(`/requests?error=${encodeURIComponent(error.error || `Failed to ${action} request`)}`);
    }
  } catch (err) {
    res.redirect('/requests?error=Server error');
  }
});

// Cancel request (mentee only)
router.post('/requests/:id/cancel', requireAuth, requireRole('mentee'), async (req, res) => {
  try {
    const response = await fetch(`http://localhost:8080/api/match-requests/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${req.cookies.token}`
      }
    });
    
    if (response.ok) {
      res.redirect('/requests?success=Request cancelled successfully');
    } else {
      const error = await response.json();
      res.redirect(`/requests?error=${encodeURIComponent(error.error || 'Failed to cancel request')}`);
    }
  } catch (err) {
    res.redirect('/requests?error=Server error');
  }
});

module.exports = router;
