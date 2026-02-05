import Stripe from 'stripe';
import env from './env.js';
import logger from '../utils/logger.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    logger.info(`Subscription created: ${subscription.id}`);
    return subscription;
  } catch (error) {
    logger.error('Error creating subscription:', error.message);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId, immediately = false) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
    });
    logger.info(`Subscription cancelled: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    logger.error('Error cancelling subscription:', error.message);
    throw error;
  }
};

export const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    logger.info(`Customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    logger.error('Error creating customer:', error.message);
    throw error;
  }
};

export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
    });
    logger.info(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    logger.error('Error creating payment intent:', error.message);
    throw error;
  }
};

export default stripe;