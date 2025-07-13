const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mentoringHistorySchema = new Schema({
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { 
        type: String, 
        enum: ['active', 'completed', 'terminated'], 
        default: 'active' 
    },
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    cancelledSessions: { type: Number, default: 0 },
    notes: { type: String },
    reasonForEnding: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
}, {
    timestamps: true
});

// Index for efficient queries
mentoringHistorySchema.index({ mentor: 1, student: 1 });
mentoringHistorySchema.index({ status: 1 });

module.exports = mongoose.model('MentoringHistory', mentoringHistorySchema); 