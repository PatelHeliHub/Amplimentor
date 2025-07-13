const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_test_key_here');
const app = express();
const PORT = 3000;
const User = require('./models/User');
const Session = require('./models/Session');
const MentoringHistory = require('./models/MentoringHistory');
const MentorRequest = require('./models/MentorRequest');
const Chat = require('./models/Chat');
const Payment = require('./models/Payment');
const Subscription = require('./models/Subscription');
const Notification = require('./models/Notification');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'web2/public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.session.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/amplimentor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware setup
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key', // Change this to a strong secret in production!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Middleware to check if user has specific role
function requireRole(role) {
  return async (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    try {
      const user = await User.findById(req.session.userId);
      if (!user || user.role !== role) {
        return res.redirect('/login');
      }
      next();
    } catch (err) {
      return res.redirect('/login');
    }
  };
}

// Serve the introduction page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the registration page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the student dashboard page
app.get('/student-dashboard.html', requireRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student-dashboard.html'));
});

// Serve the mentor dashboard page
app.get('/mentor-dashboard.html', requireRole('mentor'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mentor-dashboard.html'));
});

// Serve the student profile page
app.get('/student/profile', requireRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student-profile.html'));
});

// Serve the mentor profile page
app.get('/mentor/profile', requireRole('mentor'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mentor-profile.html'));
});

// Serve the mentor list page
app.get('/student/mentors', requireRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mentor-list.html'));
});

// Serve the my-students page
app.get('/my-students.html', requireRole('mentor'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'my-students.html'));
});

// Serve the chat page
app.get('/chat.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Serve the payment page
app.get('/payment', requireRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Serve the payment history page
app.get('/payment-history', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-history.html'));
});

// Serve the mentor pricing page
app.get('/mentor-pricing', requireRole('mentor'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mentor-pricing.html'));
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!['student', 'mentor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or mentor.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    // Auto-login after registration
    req.session.userId = user._id;
    res.status(201).json({ message: 'Registration successful!', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Store user ID in session
    req.session.userId = user._id;
    // Allow both students and mentors to log in if registered
    res.status(200).json({ message: 'Login successful!', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Profile endpoint (returns the currently logged-in user's details)
app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Student profile endpoint
app.get('/api/student/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student role required.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Mentor profile endpoint
app.get('/api/mentor/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'mentor') {
      return res.status(403).json({ message: 'Access denied. Mentor role required.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update student profile
app.put('/api/student/profile', requireRole('student'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.session.userId, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error.', details: err.message });
  }
});

app.post('/api/student/upload-photo', requireRole('student'), upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.session.userId, { photo: req.file.filename }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Photo uploaded.', filename: req.file.filename });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Update mentor profile
app.put('/api/mentor/profile', requireRole('mentor'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.session.userId, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error updating mentor profile:', err);
    res.status(500).json({ message: 'Server error.', details: err.message });
  }
});

app.post('/api/mentor/upload-photo', requireRole('mentor'), upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.session.userId, { photo: req.file.filename }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Photo uploaded.', filename: req.file.filename });
  } catch (err) {
    console.error('Error uploading mentor photo:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Serve sessions page
app.get('/sessions.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sessions.html'));
});

// Get all sessions for the current user
app.get('/api/sessions', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let sessions;
    if (user.role === 'student') {
      sessions = await Session.find({ student: req.session.userId })
        .populate('mentor', 'name email photo')
        .populate('student', 'name email photo')
        .sort({ date: 1 });
    } else {
      sessions = await Session.find({ mentor: req.session.userId })
        .populate('mentor', 'name email photo')
        .populate('student', 'name email photo')
        .sort({ date: 1 });
    }

    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create a new session
app.post('/api/sessions', requireAuth, async (req, res) => {
  try {
    const { topic, date, notes, mentor, student } = req.body;
    
    if (!topic || !date) {
      return res.status(400).json({ message: 'Topic and date are required.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let sessionData = {
      topic,
      date: new Date(date),
      notes: notes || '',
      status: 'scheduled'
    };

    if (user.role === 'student') {
      if (!mentor) {
        return res.status(400).json({ message: 'Mentor is required.' });
      }
      sessionData.student = req.session.userId;
      sessionData.mentor = mentor;
    } else {
      if (!student) {
        return res.status(400).json({ message: 'Student is required.' });
      }
      sessionData.mentor = req.session.userId;
      sessionData.student = student;
    }

    const session = new Session(sessionData);
    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('mentor', 'name email photo')
      .populate('student', 'name email photo');

    // Create or update mentoring history
    try {
      let history = await MentoringHistory.findOne({ 
        mentor: sessionData.mentor || sessionData.student, 
        student: sessionData.student || sessionData.mentor,
        status: 'active'
      });

      if (!history) {
        // Create new mentoring history
        history = new MentoringHistory({
          mentor: sessionData.mentor || sessionData.student,
          student: sessionData.student || sessionData.mentor,
          startDate: new Date(),
          status: 'active'
        });
      }

      history.totalSessions += 1;
      await history.save();
    } catch (historyError) {
      console.error('Error creating mentoring history:', historyError);
      // Don't fail the session creation if history creation fails
    }

    res.status(201).json(populatedSession);
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update a session
app.put('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, date, notes, status } = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Check if user has permission to update this session
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'student' && session.student.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (user.role === 'mentor' && session.mentor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const updateData = {};
    if (topic) updateData.topic = topic;
    if (date) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const updatedSession = await Session.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('mentor', 'name email photo')
     .populate('student', 'name email photo');

    // If session status is being updated to completed, update mentoring history
    if (status === 'completed' && session.status !== 'completed') {
      try {
        // Update mentoring history directly
        let history = await MentoringHistory.findOne({ 
          mentor: session.mentor, 
          student: session.student,
          status: 'active'
        });

        if (!history) {
          // Create new mentoring history
          history = new MentoringHistory({
            mentor: session.mentor,
            student: session.student,
            startDate: new Date(),
            status: 'active'
          });
        }

        history.totalSessions += 1;
        history.completedSessions += 1;
        await history.save();
      } catch (historyError) {
        console.error('Error updating mentoring history:', historyError);
        // Don't fail the session update if history update fails
      }
    }

    // If session status is being updated to cancelled, update mentoring history
    if (status === 'cancelled' && session.status !== 'cancelled') {
      try {
        // Update mentoring history directly
        let history = await MentoringHistory.findOne({ 
          mentor: session.mentor, 
          student: session.student,
          status: 'active'
        });

        if (!history) {
          // Create new mentoring history
          history = new MentoringHistory({
            mentor: session.mentor,
            student: session.student,
            startDate: new Date(),
            status: 'active'
          });
        }

        history.totalSessions += 1;
        history.cancelledSessions += 1;
        await history.save();
      } catch (historyError) {
        console.error('Error updating mentoring history:', historyError);
        // Don't fail the session update if history update fails
      }
    }

    res.json(updatedSession);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete a session
app.delete('/api/sessions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Check if user has permission to delete this session
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'student' && session.student.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (user.role === 'mentor' && session.mentor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await Session.findByIdAndDelete(id);
    res.json({ message: 'Session deleted successfully.' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get mentor requests for a mentor
app.get('/api/mentor/requests', requireRole('mentor'), async (req, res) => {
  try {
    const requests = await MentorRequest.find({ mentor: req.session.userId })
      .populate('student', 'name email photo standard subjects')
      .populate('mentor', 'name email photo')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching mentor requests:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get students for a mentor (accepted requests)
app.get('/api/mentor/students', requireRole('mentor'), async (req, res) => {
  try {
    const acceptedRequests = await MentorRequest.find({ 
      mentor: req.session.userId, 
      status: 'accepted' 
    }).populate('student', 'name email photo standard subjects');

    const students = acceptedRequests.map(request => request.student);
    res.json(students);
  } catch (err) {
    console.error('Error fetching mentor students:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get student requests
app.get('/api/student/requests', requireRole('student'), async (req, res) => {
  try {
    const requests = await MentorRequest.find({ student: req.session.userId })
      .populate('student', 'name email photo standard subjects')
      .populate('mentor', 'name email photo company role experience')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error('Error fetching student requests:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get mentors for a student (accepted requests)
app.get('/api/student/mentors', requireRole('student'), async (req, res) => {
  try {
    const acceptedRequests = await MentorRequest.find({ 
      student: req.session.userId, 
      status: 'accepted' 
    }).populate('mentor', 'name email photo company role experience');

    const mentors = acceptedRequests.map(request => request.mentor);
    res.json(mentors);
  } catch (err) {
    console.error('Error fetching student mentors:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all mentors (for student to browse)
app.get('/api/mentors', requireAuth, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' })
      .select('name email photo company role experience standard subjects bio location availability')
      .sort({ name: 1 });

    res.json(mentors);
  } catch (err) {
    console.error('Error fetching mentors:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create a mentor request
app.post('/api/mentor-requests', requireRole('student'), async (req, res) => {
  try {
    const { mentorId, message } = req.body;

    if (!mentorId || !message) {
      return res.status(400).json({ message: 'Mentor ID and message are required.' });
    }

    // Check if mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    // Check if request already exists
    const existingRequest = await MentorRequest.findOne({
      student: req.session.userId,
      mentor: mentorId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(409).json({ message: 'Request already exists.' });
    }

    const request = new MentorRequest({
      student: req.session.userId,
      mentor: mentorId,
      message: message
    });

    await request.save();

    const populatedRequest = await MentorRequest.findById(request._id)
      .populate('student', 'name email photo standard subjects')
      .populate('mentor', 'name email photo company role experience');

    res.status(201).json(populatedRequest);
  } catch (err) {
    console.error('Error creating mentor request:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update mentor request status (accept/reject)
app.put('/api/mentor-requests/:id', requireRole('mentor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const request = await MentorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Check if mentor owns this request
    if (request.mentor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    request.status = status;
    await request.save();

    const populatedRequest = await MentorRequest.findById(request._id)
      .populate('student', 'name email photo standard subjects')
      .populate('mentor', 'name email photo company role experience');

    res.json(populatedRequest);
  } catch (err) {
    console.error('Error updating mentor request:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get mentoring history for current user
app.get('/api/mentoring-history', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let history;
    if (user.role === 'student') {
      history = await MentoringHistory.find({ student: req.session.userId })
        .populate('mentor', 'name email photo company role experience')
        .populate('student', 'name email photo standard subjects')
        .sort({ startDate: -1 });
    } else {
      history = await MentoringHistory.find({ mentor: req.session.userId })
        .populate('mentor', 'name email photo company role experience')
        .populate('student', 'name email photo standard subjects')
        .sort({ startDate: -1 });
    }

    res.json(history);
  } catch (err) {
    console.error('Error fetching mentoring history:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create or update mentoring history when a session is completed
app.post('/api/mentoring-history', requireAuth, async (req, res) => {
  try {
    const { mentorId, studentId, sessionId, action } = req.body;
    
    if (!mentorId || !studentId) {
      return res.status(400).json({ message: 'Mentor and student IDs are required.' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user has permission to create/update this history
    if (user.role === 'student' && user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (user.role === 'mentor' && user._id.toString() !== mentorId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    let history = await MentoringHistory.findOne({ 
      mentor: mentorId, 
      student: studentId,
      status: 'active'
    });

    if (!history) {
      // Create new mentoring history
      history = new MentoringHistory({
        mentor: mentorId,
        student: studentId,
        startDate: new Date(),
        status: 'active'
      });
    }

    // Update session counts if sessionId is provided
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (session) {
        history.totalSessions += 1;
        if (action === 'complete') {
          history.completedSessions += 1;
        } else if (action === 'cancel') {
          history.cancelledSessions += 1;
        }
      }
    }

    await history.save();

    const populatedHistory = await MentoringHistory.findById(history._id)
      .populate('mentor', 'name email photo company role experience')
      .populate('student', 'name email photo standard subjects');

    res.json(populatedHistory);
  } catch (err) {
    console.error('Error creating/updating mentoring history:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// End mentoring relationship
app.put('/api/mentoring-history/:id/end', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reasonForEnding, rating, feedback } = req.body;

    const history = await MentoringHistory.findById(id);
    if (!history) {
      return res.status(404).json({ message: 'Mentoring history not found.' });
    }

    // Check if user has permission to end this relationship
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'student' && history.student.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (user.role === 'mentor' && history.mentor.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    history.status = 'completed';
    history.endDate = new Date();
    if (reasonForEnding) history.reasonForEnding = reasonForEnding;
    if (rating) history.rating = rating;
    if (feedback) history.feedback = feedback;

    await history.save();

    const populatedHistory = await MentoringHistory.findById(history._id)
      .populate('mentor', 'name email photo company role experience')
      .populate('student', 'name email photo standard subjects');

    res.json(populatedHistory);
  } catch (err) {
    console.error('Error ending mentoring relationship:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get detailed statistics for mentoring history
app.get('/api/mentoring-history/stats', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let stats;
    if (user.role === 'student') {
      stats = await MentoringHistory.aggregate([
        { $match: { student: user._id } },
        {
          $group: {
            _id: null,
            totalRelationships: { $sum: 1 },
            activeRelationships: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completedRelationships: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalSessions: { $sum: '$totalSessions' },
            completedSessions: { $sum: '$completedSessions' },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);
    } else {
      stats = await MentoringHistory.aggregate([
        { $match: { mentor: user._id } },
        {
          $group: {
            _id: null,
            totalRelationships: { $sum: 1 },
            activeRelationships: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            completedRelationships: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalSessions: { $sum: '$totalSessions' },
            completedSessions: { $sum: '$completedSessions' },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);
    }

    res.json(stats[0] || {
      totalRelationships: 0,
      activeRelationships: 0,
      completedRelationships: 0,
      totalSessions: 0,
      completedSessions: 0,
      averageRating: 0
    });
  } catch (err) {
    console.error('Error fetching mentoring stats:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Utility endpoint to check current mentor-student relationships
app.get('/api/debug/relationships', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let mentorRequests, mentoringHistory, sessions;
    
    if (user.role === 'mentor') {
      mentorRequests = await MentorRequest.find({ mentor: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
      
      mentoringHistory = await MentoringHistory.find({ mentor: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
      
      sessions = await Session.find({ mentor: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
    } else {
      mentorRequests = await MentorRequest.find({ student: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
      
      mentoringHistory = await MentoringHistory.find({ student: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
      
      sessions = await Session.find({ student: user._id })
        .populate('student', 'name email')
        .populate('mentor', 'name email');
    }

    res.json({
      user: { name: user.name, role: user.role },
      mentorRequests: mentorRequests,
      mentoringHistory: mentoringHistory,
      sessions: sessions
    });
  } catch (err) {
    console.error('Error fetching debug info:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out.' });
});

// Logout endpoint (GET request for direct navigation)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// API to get all chats for a user
app.get('/api/chats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const chats = await Chat.find({
      $or: [
        { student: userId },
        { mentor: userId }
      ]
    })
      .populate('student', 'name email photo role')
      .populate('mentor', 'name email photo role')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name email photo role'
        }
      })
      .sort({ 'messages.timestamp': -1 });
    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API to get messages for a specific chat
app.get('/api/chats/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId;
    const chat = await Chat.findById(chatId)
      .populate('student', 'name email photo role')
      .populate('mentor', 'name email photo role')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name email photo role'
        }
      });

    if (!chat || (!chat.student.equals(userId) && !chat.mentor.equals(userId))) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat.messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API to send a message
app.post('/api/chats/:chatId/messages', requireAuth, upload.single('attachment'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.session.userId;
    const content = req.body.content;
    const file = req.file;
    const chat = await Chat.findById(chatId)
      .populate('student', 'name email photo role')
      .populate('mentor', 'name email photo role');
    if (!chat || (!chat.student.equals(userId) && !chat.mentor.equals(userId))) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    if (!content && !file) {
      return res.status(400).json({ message: 'Message content or attachment required.' });
    }
    const message = {
      sender: userId,
      content: content || '',
      timestamp: new Date()
    };
    if (file) {
      message.attachment = file.filename;
    }
    chat.messages.push(message);
    await chat.save();
    // Create notification for the other participant
    let recipient = chat.student.equals(userId) ? chat.mentor : chat.student;
    await Notification.create({
      user: recipient,
      type: 'chat',
      text: `New message from ${req.session.userName || 'a user'}`,
      link: `/chat.html?chatId=${chatId}`
    });
    const populatedChat = await Chat.findById(chatId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name email photo role'
        }
      });
    res.status(201).json(populatedChat.messages[populatedChat.messages.length - 1]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// API for notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.session.userId, read: false })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ count: notifications.length, notifications });
  } catch (err) {
    res.json({ count: 0, notifications: [] });
  }
});

// ==================== PAYMENT ROUTES ====================

// Get Stripe publishable key
app.get('/api/payment/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key_here'
  });
});

// Create payment intent for session booking
app.post('/api/payment/create-payment-intent', requireRole('student'), async (req, res) => {
  try {
    const { mentorId, sessionId, amount, description } = req.body;
    
    if (!mentorId || !amount) {
      return res.status(400).json({ message: 'Mentor ID and amount are required.' });
    }

    const student = await User.findById(req.session.userId);
    const mentor = await User.findById(mentorId);
    
    if (!student || !mentor) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create or get Stripe customer
    let customerId = student.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: student.email,
        name: student.name,
        metadata: {
          userId: student._id.toString()
        }
      });
      customerId = customer.id;
      student.stripeCustomerId = customerId;
      await student.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        studentId: student._id.toString(),
        mentorId: mentor._id.toString(),
        sessionId: sessionId || '',
        description: description || 'Mentoring session payment'
      },
      description: description || 'Mentoring session payment'
    });

    // Create payment record
    const payment = new Payment({
      student: student._id,
      mentor: mentor._id,
      session: sessionId,
      amount: amount,
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customerId,
      description: description || 'Mentoring session payment',
      status: 'pending'
    });
    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent.' });
  }
});

// Confirm payment
app.post('/api/payment/confirm', requireRole('student'), async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;
    
    if (!paymentIntentId || !paymentId) {
      return res.status(400).json({ message: 'Payment intent ID and payment ID are required.' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    // Verify payment belongs to user
    if (payment.student.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      await payment.save();
      
      res.json({ 
        message: 'Payment confirmed successfully.',
        payment: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      
      res.status(400).json({ 
        message: 'Payment failed.',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment.' });
  }
});

// Create subscription
app.post('/api/payment/create-subscription', requireRole('student'), async (req, res) => {
  try {
    const { mentorId, plan, interval, priceId } = req.body;
    
    if (!mentorId || !plan || !interval || !priceId) {
      return res.status(400).json({ message: 'Mentor ID, plan, interval, and price ID are required.' });
    }

    const student = await User.findById(req.session.userId);
    const mentor = await User.findById(mentorId);
    
    if (!student || !mentor) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create or get Stripe customer
    let customerId = student.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: student.email,
        name: student.name,
        metadata: {
          userId: student._id.toString()
        }
      });
      customerId = customer.id;
      student.stripeCustomerId = customerId;
      await student.save();
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        studentId: student._id.toString(),
        mentorId: mentor._id.toString(),
        plan: plan
      }
    });

    // Create subscription record
    const subscriptionRecord = new Subscription({
      student: student._id,
      mentor: mentor._id,
      plan: plan,
      amount: subscription.items.data[0].price.unit_amount,
      currency: subscription.items.data[0].price.currency,
      interval: interval,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      sessionsPerMonth: plan === 'basic' ? 4 : plan === 'premium' ? 8 : 12
    });
    await subscriptionRecord.save();

    res.json({
      subscription: subscriptionRecord,
      stripeSubscription: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription.' });
  }
});

// Cancel subscription
app.post('/api/payment/cancel-subscription', requireRole('student'), async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ message: 'Subscription ID is required.' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    // Verify subscription belongs to user
    if (subscription.student.toString() !== req.session.userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Cancel subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update local subscription record
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({ 
      message: 'Subscription cancelled successfully.',
      subscription: subscription
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription.' });
  }
});

// Get payment history
app.get('/api/payment/history', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let payments, subscriptions;
    
    if (user.role === 'student') {
      payments = await Payment.find({ student: user._id })
        .populate('mentor', 'name email photo')
        .populate('session', 'topic date')
        .sort({ createdAt: -1 });
      
      subscriptions = await Subscription.find({ student: user._id })
        .populate('mentor', 'name email photo')
        .sort({ createdAt: -1 });
    } else {
      payments = await Payment.find({ mentor: user._id })
        .populate('student', 'name email photo')
        .populate('session', 'topic date')
        .sort({ createdAt: -1 });
      
      subscriptions = await Subscription.find({ mentor: user._id })
        .populate('student', 'name email photo')
        .sort({ createdAt: -1 });
    }

    res.json({
      payments: payments,
      subscriptions: subscriptions
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Error fetching payment history.' });
  }
});

// Get mentor pricing
app.get('/api/mentor/:mentorId/pricing', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor not found.' });
    }

    res.json({
      hourlyRate: mentor.hourlyRate,
      sessionRate: mentor.sessionRate,
      subscriptionPlans: mentor.subscriptionPlans
    });
  } catch (error) {
    console.error('Error fetching mentor pricing:', error);
    res.status(500).json({ message: 'Error fetching mentor pricing.' });
  }
});

// Update mentor pricing
app.put('/api/mentor/pricing', requireRole('mentor'), async (req, res) => {
  try {
    const { hourlyRate, sessionRate, subscriptionPlans } = req.body;
    
    const mentor = await User.findById(req.session.userId);
    if (!mentor) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (hourlyRate !== undefined) mentor.hourlyRate = hourlyRate;
    if (sessionRate !== undefined) mentor.sessionRate = sessionRate;
    if (subscriptionPlans !== undefined) mentor.subscriptionPlans = subscriptionPlans;

    await mentor.save();

    res.json({
      message: 'Pricing updated successfully.',
      pricing: {
        hourlyRate: mentor.hourlyRate,
        sessionRate: mentor.sessionRate,
        subscriptionPlans: mentor.subscriptionPlans
      }
    });
  } catch (error) {
    console.error('Error updating mentor pricing:', error);
    res.status(500).json({ message: 'Error updating pricing.' });
  }
});

// Webhook for Stripe events
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret_here';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'completed' }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: failedPaymentIntent.id },
          { status: 'failed' }
        );
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        );
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: deletedSubscription.id },
          { status: 'cancelled' }
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Amplimentor server running at http://localhost:${PORT}`);
}); 