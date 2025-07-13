const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    date: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled'], 
        default: 'scheduled' 
    },
    notes: { type: String },
    meetingLink: { type: String, trim: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema); 