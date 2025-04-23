const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5001;

const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const jwt = require('jsonwebtoken');

// middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// import routes
const authRoutes = require("./api/routes/authRoutes");
app.use("/auth", authRoutes);

const menuRoutes = require("./api/routes/menuRoutes");
app.use("/menu", menuRoutes);

const cartsRoutes = require("./api/routes/cartRoutes");
app.use("/carts", cartsRoutes);

const usersRoutes = require("./api/routes/userRoutes");
app.use("/users", usersRoutes);

const paymentRoutes = require("./api/routes/paymentRoutes");
app.use("/payments", paymentRoutes);

const adminStats = require('./api/routes/adminStats');
app.use('/admin-stats', adminStats);

const orderStats = require('./api/routes/orderStats');
app.use('/order-stats', orderStats);

const buffetRoutes = require("./api/routes/buffetRoutes");
app.use("/buffet", buffetRoutes);

const reviewRoutes = require("./api/routes/reviewRoutes");
app.use("/reviews", reviewRoutes);

// payment methods routes
const verifyToken = require('./api/middlewares/verifyToken');

app.post("/create-payment-intent", verifyToken, async (req, res) => {
  try {
    const { price } = req.body;
    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    const amount = Math.round(price * 100); // Convert to cents and round to avoid floating point issues

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      payment_method_types: ["card"],
      description: "Food and Beverage Services - Catering Order",
      metadata: {
        userId: req.userId, // Add user ID to payment metadata
        serviceType: "catering",
        country: "IN"
      },
      shipping: {
        name: req.body.name || "Customer",
        address: {
          line1: req.body.address || "Default Address",
          city: req.body.city || "Default City",
          state: req.body.state || "Default State",
          postal_code: req.body.postal_code || "000000",
          country: "IN"
        }
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "CATER-SEGEN is Running!",
    version: process.env.npm_package_version || "1.0.0"
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server with error handling
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}).on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
