# Payment System Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in your project root with the following variables:

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

### 3. Get Stripe API Keys

1. Sign up for a Stripe account at [stripe.com](https://stripe.com)
2. Go to the Stripe Dashboard
3. Navigate to Developers > API Keys
4. Copy your test keys:
   - **Publishable key**: Starts with `pk_test_`
   - **Secret key**: Starts with `sk_test_`

### 4. Set Up Webhooks (Optional for Testing)

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret

### 5. Start the Server
```bash
npm start
```

## Testing the Payment System

### Test Card Numbers
Use these Stripe test cards:

- **Successful Payment**: `4242 4242 4242 4242`
- **Declined Payment**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Flow
1. Register as a student
2. Register as a mentor
3. Set mentor pricing
4. Browse mentors as a student
5. Click "Book Session" to test payment

## Production Deployment

### 1. Update Environment Variables
Replace test keys with live keys:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
```

### 2. Update Webhook Endpoint
Point webhooks to your production domain

### 3. Enable HTTPS
Stripe requires HTTPS for production

### 4. Test Thoroughly
Always test payment flows in production mode

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check Stripe API keys
   - Verify amount is in cents
   - Ensure user is authenticated

2. **Webhook Not Working**
   - Verify webhook endpoint URL
   - Check webhook secret
   - Ensure HTTPS is enabled

3. **Payment Not Confirming**
   - Check payment intent status
   - Verify webhook processing
   - Review server logs

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=stripe:*
```

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Enable webhook signature verification
- Implement proper error handling
- Use HTTPS in production

## Support

For issues with:
- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Application Issues**: Review server logs and error messages
- **Setup Problems**: Verify environment variables and configuration 