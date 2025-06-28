const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Proxy API calls to backend
app.use('/api', proxy({
  target: 'http://localhost:8080',
  changeOrigin: true
}));

// Serve static files from backend for images
app.use('/api/images', proxy({
  target: 'http://localhost:8080',
  changeOrigin: true
}));

// Serve all other requests from the main server
app.use('/', proxy({
  target: 'http://localhost:8080',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`Frontend server is running on http://localhost:${PORT}`);
  console.log(`Make sure backend server is running on http://localhost:8080`);
});
