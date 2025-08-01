const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/create-order', async (req, res) => {
  const { amount, receipt } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });
    res.json({ key_id: process.env.RAZORPAY_KEY_ID, order_id: order.id, amount: order.amount });
  } catch (err) {
    res.status(500).json({ error: 'Order creation failed' });
  }
});

app.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const digest = hmac.digest('hex');
  res.json({ verified: digest === razorpay_signature });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
