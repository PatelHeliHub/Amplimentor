# Amplimentor API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid session cookie. Include `credentials: 'include'` in your fetch requests.

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "Registration successful!",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful!",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Logout User
```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logged out."
}
```

### Get User Profile
```http
GET /auth/profile
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "photo": "profile-photo.jpg",
  "studentId": "STU001",
  "standard": "12",
  "university": "Example University",
  "subjects": ["Mathematics", "Physics"],
  "gpa": "3.8"
}
```

## User Management

### Update Student Profile
```http
PUT /student/profile
```

**Request Body:**
```json
{
  "name": "John Doe",
  "studentId": "STU001",
  "standard": "12",
  "university": "Example University",
  "subjects": ["Mathematics", "Physics"],
  "gpa": "3.8",
  "bio": "Passionate student interested in STEM"
}
```

### Update Mentor Profile
```http
PUT /mentor/profile
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "company": "Tech Corp",
  "experience": "5 years",
  "location": "New York",
  "expertiseAreas": ["JavaScript", "React"],
  "hourlyRate": 75,
  "bio": "Experienced software engineer"
}
```

### Upload Profile Photo (Student)
```http
POST /student/upload-photo
Content-Type: multipart/form-data
```

**Form Data:**
- `photo`: Image file

### Upload Profile Photo (Mentor)
```http
POST /mentor/upload-photo
Content-Type: multipart/form-data
```

**Form Data:**
- `photo`: Image file

## Sessions

### Get User Sessions
```http
GET /sessions
```

**Response:**
```json
[
  {
    "_id": "session_id",
    "topic": "JavaScript Fundamentals",
    "date": "2024-01-15T10:00:00.000Z",
    "status": "scheduled",
    "mentor": {
      "_id": "mentor_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "photo": "mentor-photo.jpg"
    },
    "student": {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com",
      "photo": "student-photo.jpg"
    }
  }
]
```

### Create Session
```http
POST /sessions
```

**Request Body:**
```json
{
  "topic": "JavaScript Fundamentals",
  "date": "2024-01-15T10:00:00.000Z",
  "notes": "Focus on ES6 features",
  "mentor": "mentor_id"
}
```

### Update Session
```http
PUT /sessions/:id
```

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Great session! Covered ES6 features"
}
```

## Payments

### Create Payment Intent
```http
POST /payment/create-payment-intent
```

**Request Body:**
```json
{
  "mentorId": "mentor_id",
  "sessionId": "session_id",
  "amount": 5000,
  "description": "JavaScript mentoring session"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentId": "payment_id"
}
```

### Create Subscription
```http
POST /payment/create-subscription
```

**Request Body:**
```json
{
  "mentorId": "mentor_id",
  "plan": "basic",
  "interval": "monthly",
  "priceId": "price_xxx"
}
```

### Get Payment History
```http
GET /payment/history
```

**Response:**
```json
[
  {
    "_id": "payment_id",
    "amount": 5000,
    "status": "succeeded",
    "description": "JavaScript mentoring session",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "mentor": {
      "name": "Jane Smith"
    }
  }
]
```

## Mentors

### Get All Mentors
```http
GET /mentors
```

**Response:**
```json
[
  {
    "_id": "mentor_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "photo": "mentor-photo.jpg",
    "company": "Tech Corp",
    "experience": "5 years",
    "expertiseAreas": ["JavaScript", "React"],
    "hourlyRate": 75,
    "bio": "Experienced software engineer"
  }
]
```

### Get Mentor by ID
```http
GET /mentors/:id
```

## Students

### Get Mentor's Students
```http
GET /mentor/students
```

**Response:**
```json
[
  {
    "_id": "student_id",
    "name": "John Doe",
    "email": "john@example.com",
    "photo": "student-photo.jpg",
    "university": "Example University",
    "subjects": ["Mathematics", "Physics"]
  }
]
```

## Chat

### Get Chat Messages
```http
GET /chat/:sessionId
```

### Send Message
```http
POST /chat/:sessionId
```

**Request Body:**
```json
{
  "message": "Hello! How are you today?",
  "sender": "student_id"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authenticated."
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Student role required."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error."
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## CORS

The API supports CORS for requests from `http://localhost:3001` in development. 