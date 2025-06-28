const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');

// Import middleware
const { initDatabase } = require('./middleware/database');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize database
initDatabase();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https://placehold.co", "https://unpkg.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://unpkg.com", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// OpenAPI/Swagger setup
const openApiPath = path.join(__dirname, 'openapi.yaml');
if (fs.existsSync(openApiPath)) {
  const swaggerDocument = YAML.load(openApiPath);
  
  // Swagger UI options
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  };
  
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  app.get('/openapi.json', (req, res) => {
    res.json(swaggerDocument);
  });
  console.log('Swagger UI configured at /swagger-ui');
} else {
  console.warn('OpenAPI spec file not found at:', openApiPath);
}

// Routes - API routes first
app.use('/api', authRoutes);
app.use('/api', apiRoutes);

// Redirect /api to Swagger UI for API documentation
app.get('/api', (req, res) => {
  res.redirect('/swagger-ui');
});

// Redirect root to Swagger UI for API documentation  
app.get('/', (req, res) => {
  res.redirect('/swagger-ui');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.path.startsWith('/api/')) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).render('error', { error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).render('error', { error: 'Page not found' });
  }
});

// Start backend server
app.listen(PORT, () => {
  console.log(`🔧 Backend API Server is running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}/swagger-ui`);
  console.log(`🌐 OpenAPI JSON available at http://localhost:${PORT}/openapi.json`);
  console.log(`💡 Start frontend with: npm run frontend`);
});
