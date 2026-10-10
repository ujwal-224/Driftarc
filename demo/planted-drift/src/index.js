import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123');

// 1. Planted drift: MongoDB used instead of documented Postgres
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shop';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB database'))
  .catch(err => console.error('MongoDB connection error:', err));

// 2. Planted drift: RabbitMQ message queue actively used but not drawn in diagram
async function connectQueue() {
  const queueUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  const conn = await amqp.connect(queueUrl);
  const channel = await conn.createChannel();
  await channel.assertQueue('orders_queue');
  console.log('RabbitMQ channel created');
}

// 3. Planted drift: Notice Redis is NOT imported or configured anywhere in this repo!

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Planted Drift Demo API' });
});

app.post('/checkout', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd'
  });
  res.json({ clientSecret: paymentIntent.client_secret });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Demo API running on port ${PORT}`);
  connectQueue().catch(console.error);
});
