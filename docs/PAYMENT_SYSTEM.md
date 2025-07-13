# Payment System Documentation

## Overview

The Amplimentor platform now includes a comprehensive payment system built with Stripe integration. This system allows students to pay for mentoring sessions and subscriptions, while mentors can set their own pricing.

## Features

### For Students
- **One-time Session Payments**: Pay for individual mentoring sessions
- **Subscription Plans**: Subscribe to mentors with recurring payments
- **Payment History**: View all past transactions and subscriptions
- **Secure Payment Processing**: Stripe-powered secure payment processing

### For Mentors
- **Pricing Management**: Set hourly rates, session rates, and subscription plans
- **Payment Tracking**: View payments received from students
- **Flexible Pricing**: Create multiple subscription tiers

## Technical Implementation

### Backend Components

#### Models
1. **Payment Model** (`web2/models/Payment.js`)
   - Tracks individual payment transactions
   - Stores Stripe payment intent IDs
   - Handles payment status (pending, completed, failed, refunded)

2. **Subscription Model** (`web2/models/Subscription.js`)
   - Manages recurring subscription payments
   - Tracks subscription periods and billing cycles
   - Handles subscription status (active, cancelled, expired)

3. **Updated User Model** (`web2/models/User.js`)
   - Added payment-related fields (Stripe customer ID, payment methods)
   - Added pricing fields for mentors (hourly rate, session rate, subscription plans)
   - Added billing address information

#### API Endpoints

##### Payment Processing
- `POST /api/payment/create-payment-intent` - Create Stripe payment intent
- `POST /api/payment/confirm` - Confirm payment completion
- `POST /api/payment/create-subscription` - Create subscription
- `POST /api/payment/cancel-subscription` - Cancel subscription

##### Payment Management
- `GET /api/payment/history` - Get payment history
- `GET /api/payment/config` - Get Stripe configuration
- `GET /api/mentor/:mentorId/pricing` - Get mentor pricing
- `PUT /api/mentor/pricing` - Update mentor pricing

##### Webhooks
- `POST /api/payment/webhook` - Handle Stripe webhook events

### Frontend Components

#### Pages
1. **Payment Page** (`web2/public/payment.html`)
   - Stripe Elements integration for card input
   - Payment form with billing information
   - Support for one-time payments and subscriptions

2. **Payment History** (`web2/public/payment-history.html`)
   - View all payment transactions
   - Track subscription status
   - Payment statistics and summaries

3. **Mentor Pricing** (`web2/public/mentor-pricing.html`)
   - Set hourly and session rates
   - Create and manage subscription plans
   - Real-time pricing preview

#### Integration
- **Mentor List**: Shows pricing information and payment buttons
- **Student Dashboard**: Payment history link
- **Mentor Dashboard**: Pricing management link

## Setup Instructions

### 1. Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Set environment variables:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### 2. Database Setup

The payment system uses MongoDB with the following collections:
- `payments` - Payment transactions
- `subscriptions` - Subscription records
- `users` - Updated with payment fields

### 3. Webhook Configuration

1. Set up Stripe webhook endpoint in your Stripe Dashboard
2. Point to: `https://yourdomain.com/api/payment/webhook`
3. Subscribe to these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## Usage Guide

### For Students

#### Booking a Session
1. Browse mentors on the mentor list page
2. Click "Book Session" on a mentor's card
3. You'll be redirected to the payment page
4. Enter your card details and billing information
5. Complete the payment
6. The session will be automatically scheduled

#### Managing Subscriptions
1. Visit a mentor's profile
2. Choose a subscription plan
3. Complete the payment setup
4. Manage your subscription from the payment history page

### For Mentors

#### Setting Up Pricing
1. Go to your mentor dashboard
2. Click "Pricing" in the navigation
3. Set your hourly and session rates
4. Create subscription plans if desired
5. Save your pricing

#### Viewing Payments
1. Access payment history from your dashboard
2. View all payments received
3. Track subscription revenue

## Security Features

- **Stripe Integration**: All payment processing handled by Stripe
- **Webhook Verification**: Ensures payment events are legitimate
- **User Authentication**: All payment endpoints require authentication
- **Data Encryption**: Sensitive data encrypted in transit and at rest

## Testing

### Test Cards
Use these Stripe test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Mode
The system is configured for Stripe test mode by default. For production:
1. Replace test keys with live keys
2. Update webhook endpoints
3. Test thoroughly in production environment

## Error Handling

The system includes comprehensive error handling for:
- Payment failures
- Network errors
- Invalid payment data
- Webhook processing errors
- Database connection issues

## Future Enhancements

Potential improvements:
- PayPal integration
- Multiple currency support
- Advanced subscription features
- Payment analytics dashboard
- Automated invoicing
- Refund management interface

## Support

For technical support or questions about the payment system:
1. Check the Stripe documentation
2. Review server logs for error details
3. Test with Stripe's test mode first
4. Contact the development team

## License

This payment system is part of the Amplimentor platform and follows the same licensing terms. 