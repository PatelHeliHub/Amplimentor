# Amplimentor - Mentoring Platform

A comprehensive mentoring platform that connects students with mentors, featuring authentication, session management, payment processing, and real-time communication.

## Project Structure

```
Amplimentor/
├── backend/                 # Backend API Server
│   ├── config/             # Configuration files
│   │   └── database.js     # Database connection
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # Authentication middleware
│   ├── models/             # MongoDB models
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Chat.js
│   │   ├── Payment.js
│   │   ├── Subscription.js
│   │   ├── Notification.js
│   │   ├── MentoringHistory.js
│   │   └── MentorRequest.js
│   ├── routes/             # API routes
│   │   └── auth.js         # Authentication routes
│   ├── uploads/            # File uploads directory
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # Frontend Application
│   ├── pages/              # HTML pages
│   │   ├── index.html      # Landing page
│   │   ├── login.html      # Login page
│   │   ├── register.html   # Registration page
│   │   ├── student-dashboard.html
│   │   ├── mentor-dashboard.html
│   │   ├── mentor-list.html
│   │   ├── mentor-profile.html
│   │   ├── student-profile.html
│   │   ├── chat.html
│   │   ├── sessions.html
│   │   ├── payment.html
│   │   └── ... (other pages)
│   ├── css/                # Stylesheets
│   │   └── style.css       # Main stylesheet
│   ├── js/                 # JavaScript files
│   ├── images/             # Static images
│   │   └── default-avatar.svg
│   ├── assets/             # Other assets
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

## Features

### Authentication & Authorization
- User registration (Student/Mentor roles)
- Login/logout functionality
- Session-based authentication
- Role-based access control
- Password hashing with bcrypt

### User Management
- Student and Mentor profiles
- Profile photo uploads
- Personal information management
- Role-specific fields and preferences

### Mentoring System
- Mentor discovery and browsing
- Session scheduling and management
- Mentoring history tracking
- Real-time chat functionality

### Payment System
- Stripe integration for payments
- Session booking payments
- Subscription management
- Payment history tracking

### File Management
- Profile photo uploads
- Image processing with Sharp
- Secure file storage

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- Stripe account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/amplimentor

# Session Configuration
SESSION_SECRET=your_session_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### User Management
- `PUT /api/student/profile` - Update student profile
- `PUT /api/mentor/profile` - Update mentor profile
- `POST /api/student/upload-photo` - Upload student photo
- `POST /api/mentor/upload-photo` - Upload mentor photo

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session

### Payments
- `POST /api/payment/create-payment-intent` - Create payment intent
- `POST /api/payment/create-subscription` - Create subscription
- `GET /api/payment/history` - Get payment history

## Development

### Backend Development
- The backend uses Express.js with MongoDB
- Authentication middleware protects routes
- File uploads handled with Multer
- Payment processing with Stripe

### Frontend Development
- Pure HTML/CSS/JavaScript frontend
- Responsive design with CSS Grid and Flexbox
- Client-side form validation
- AJAX requests to backend API

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Role-based authorization
- Input validation and sanitization
- Secure file upload handling
- CORS configuration

## Deployment

### Backend Deployment
1. Set up environment variables for production
2. Use a process manager like PM2
3. Set up MongoDB Atlas or similar
4. Configure Stripe live keys

### Frontend Deployment
1. Build static files
2. Deploy to CDN or static hosting
3. Update API endpoints to production URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License 