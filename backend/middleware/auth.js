const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'mentor-mentee-secret-key-2024';
const JWT_ISSUER = 'mentor-mentee-app';
const JWT_AUDIENCE = 'mentor-mentee-users';

function generateToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (60 * 60); // 1 hour
  
  const payload = {
    // Standard claims (RFC 7519)
    iss: JWT_ISSUER,
    sub: user.id.toString(),
    aud: JWT_AUDIENCE,
    exp: exp,
    nbf: now,
    iat: now,
    jti: uuidv4(),
    
    // Custom claims
    name: user.name || user.email,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

// Helper function to create expired token for testing
function generateExpiredToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now - 3600; // Expired 1 hour ago
  
  const payload = {
    // Standard claims (RFC 7519)
    iss: JWT_ISSUER,
    sub: user.id.toString(),
    aud: JWT_AUDIENCE,
    exp: exp,
    nbf: now - 7200,
    iat: now - 7200,
    jti: uuidv4(),
    
    // Custom claims
    name: user.name || user.email,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET);
}

function verifyToken(req, res, next) {
  console.log('verifyToken called for:', req.originalUrl, req.path);
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header, path:', req.originalUrl);
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  
  // Check for malformed token
  if (!token || token === 'not-a-jwt-token' || token.split('.').length !== 3) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function checkRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function checkMentee(req, res, next) {
  if (req.user.role !== 'mentee') {
    return res.status(403).json({ error: 'Only mentees can access this resource' });
  }
  next();
}

function checkMentor(req, res, next) {
  if (req.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Only mentors can access this resource' });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  checkRole,
  checkMentee,
  checkMentor,
  generateExpiredToken
};
