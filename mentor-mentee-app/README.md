# Mentor-Mentee Matching Platform

A full-stack web application for connecting mentors and mentees, built with Node.js, Express.js, and EJS templates.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Role-based Access**: Separate interfaces for mentors and mentees
- **Profile Management**: Users can update their profiles with images and skills
- **Mentor Discovery**: Mentees can search and filter mentors by skills
- **Match Requests**: Send, accept, reject, and cancel mentoring requests
- **Real-time Status**: Track request status and manage connections
- **API Documentation**: Built-in Swagger UI for API exploration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Server-side rendering with EJS templates
- **Database**: SQLite
- **Authentication**: JWT with bcrypt password hashing
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer for profile images

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Running

1. Install dependencies
```bash
npm install
```

2. **Option 1: Background Mode (Recommended for Testing)**
```bash
# Start both servers in background
npm run start:bg

# Check server status
npm run status

# Stop all servers
npm run stop:bg
```

3. **Option 2: Individual Background Control**
```bash
# Start backend only (background)
npm run backend:bg

# Start frontend only (background)  
npm run frontend:bg

# Stop backend only
npm run stop:backend

# Stop frontend only
npm run stop:frontend

# Check status
npm run status
```

4. **Option 3: Separate Terminals (Foreground)**
```bash
# Terminal 1: Start backend server (Port 8080)
npm start

# Terminal 2: Start frontend server (Port 3000) 
npm run frontend
```

5. **Option 4: Combined Start (Foreground)**
```bash
npm run full-start
```
```bash
npm run frontend
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/swagger-ui

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### User Profile
- `GET /api/me` - Get current user info
- `PUT /api/profile` - Update user profile
- `GET /api/images/{role}/{id}` - Get profile image

### Mentors (Mentee access only)
- `GET /api/mentors` - List mentors with filtering and sorting

### Match Requests
- `POST /api/match-requests` - Send match request (mentee only)
- `GET /api/match-requests/incoming` - Get incoming requests (mentor only)
- `GET /api/match-requests/outgoing` - Get outgoing requests (mentee only)
- `PUT /api/match-requests/{id}/accept` - Accept request (mentor only)
- `PUT /api/match-requests/{id}/reject` - Reject request (mentor only)
- `DELETE /api/match-requests/{id}` - Cancel request (mentee only)

## User Roles

### Mentor
- Create profile with skills and bio
- View incoming match requests
- Accept/reject requests (only one active mentee at a time)
- Manage mentoring relationship

### Mentee
- Browse and search mentors by skills
- Send match requests with personalized messages
- Track request status
- Cancel pending requests

## Security Features

- Password hashing with bcrypt
- JWT authentication with proper claims (RFC 7519 compliant)
- Rate limiting on API endpoints
- Input validation and sanitization
- XSS and SQL injection protection
- Secure headers with Helmet.js

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `role` - 'mentor' or 'mentee'
- `bio` - User biography
- `skills` - JSON array of skills (mentors only)
- `image_data` - Binary image data
- `image_type` - Image MIME type

### Match Requests Table
- `id` - Primary key
- `mentor_id` - Foreign key to users
- `mentee_id` - Foreign key to users
- `message` - Request message
- `status` - 'pending', 'accepted', 'rejected', 'cancelled'
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Development

### Development Mode
```bash
npm run dev  # Backend with nodemon
```

### Project Structure
```
mentor-mentee-app/
├── server.js              # Main server file
├── frontend.js            # Frontend proxy server
├── package.json           # Dependencies and scripts
├── openapi.yaml          # API documentation
├── middleware/           # Custom middleware
│   ├── database.js       # Database connection and init
│   └── auth.js          # JWT authentication
├── routes/              # Route handlers
│   ├── auth.js         # Authentication routes
│   ├── api.js          # API routes
│   └── web.js          # Web routes
└── views/              # EJS templates
    ├── login.ejs       # Login page
    ├── signup.ejs      # Signup page
    ├── profile.ejs     # Profile management
    ├── mentors.ejs     # Mentor listing
    ├── requests.ejs    # Request management
    └── error.ejs       # Error page
```

## Requirements Compliance

This application meets all the specified requirements:

✅ User authentication with JWT  
✅ Role-based access (mentor/mentee)  
✅ Profile management with image upload  
✅ Mentor search and filtering  
✅ Match request system  
✅ Request status management  
✅ OpenAPI documentation  
✅ Swagger UI integration  
✅ Security best practices  
✅ SQLite database  
✅ Server-side rendering  

## Test Elements

The application includes all required test IDs for automated testing:

- Login: `#email`, `#password`, `#login`
- Signup: `#email`, `#password`, `#role`, `#signup`
- Profile: `#name`, `#bio`, `#skillsets`, `#profile-photo`, `#profile`, `#save`
- Mentors: `.mentor`, `#search`, `#name`, `#skill`
- Requests: `#message`, `#request-status`, `#request`, `#accept`, `#reject`

## License

MIT License
