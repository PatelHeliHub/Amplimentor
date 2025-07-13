const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'mentor'], required: true },
  
  // Student-specific fields
  photo: { type: String },
  studentId: { type: String },
  standard: { type: String, enum: ['9', '10', '11', '12', null] },
  university: { type: String }, // For school name
  subjects: [{ type: String }],
  gpa: { type: String },
  
  // Personal Information
  dateOfBirth: { type: Date },
  phoneNumber: { type: String },
  address: { type: String },
  bio: { type: String },
  
  // Professional Links
  linkedIn: { type: String },
  github: { type: String },
  
  // Goals & Mentorship Preferences
  careerGoals: { type: String },
  skillsToDevelop: [String],
  areasOfInterest: [String],
  meetingFrequency: { type: String },
  communicationPreference: { type: String },

  // Mentor-specific fields
  company: { type: String },
  experience: { type: String },
  location: { type: String },
  portfolio: { type: String },
  expertiseAreas: [String],
  technicalSkills: [String],
  industry: { type: String },
  mentoringStyle: { type: String },
  availability: { type: String },
  maxStudents: { type: String },
  education: { type: String },
  certifications: [String],

  // Payment-related fields
  stripeCustomerId: { type: String },
  paymentMethods: [{
    id: { type: String },
    type: { type: String }, // 'card', 'bank_account'
    last4: { type: String },
    brand: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  billingAddress: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String }
  },
  
  // Mentor pricing
  hourlyRate: { type: Number, default: 50 }, // in cents
  sessionRate: { type: Number, default: 2000 }, // in cents
  subscriptionPlans: [{
    name: { type: String },
    price: { type: Number }, // in cents
    sessions: { type: Number },
    interval: { type: String, enum: ['monthly', 'quarterly', 'yearly'] }
  }],

  // Obsolete fields - kept for now to avoid breaking old records, can be removed later
  major: { type: String },
  yearLevel: { type: String },
  fieldOfStudy: { type: String },
  currentYear: { type: String },
  graduationYear: { type: String },
  preferredAreas: [String],

});

module.exports = mongoose.model('User', UserSchema); 