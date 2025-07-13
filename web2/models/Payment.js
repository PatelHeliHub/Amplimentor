const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    session: { type: Schema.Types.ObjectId, ref: 'Session' },
    amount: { type: Number, required: true }, // Amount in cents
    currency: { type: String, default: 'usd' },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, required: true }, // 'stripe', 'paypal', etc.
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    description: { type: String },
    metadata: { type: Schema.Types.Mixed },
    refundedAt: { type: Date },
    refundAmount: { type: Number },
    refundReason: { type: String }
}, {
    timestamps: true
});

// Index for efficient queries
paymentSchema.index({ student: 1, mentor: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema); 