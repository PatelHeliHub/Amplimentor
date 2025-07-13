const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, required: true }, // 'basic', 'premium', 'enterprise'
    amount: { type: Number, required: true }, // Amount in cents
    currency: { type: String, default: 'usd' },
    interval: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
    status: { 
        type: String, 
        enum: ['active', 'cancelled', 'expired', 'past_due'], 
        default: 'active' 
    },
    stripeSubscriptionId: { type: String },
    stripeCustomerId: { type: String },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    sessionsPerMonth: { type: Number, default: 4 },
    features: [{ type: String }], // Array of features included in this plan
    metadata: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ student: 1, mentor: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema); 