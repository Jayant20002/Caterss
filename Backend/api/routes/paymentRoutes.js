const express = require('express');
const Payment = require('../models/Payments');
const router = express.Router();

const mongoose = require('mongoose');
const Cart = require('../models/Carts'); // Import your Cart model
const ObjectId = mongoose.Types.ObjectId;

// token
const verifyToken = require('../middlewares/verifyToken')

// Create a new payment - PUBLIC ROUTE FOR CHECKOUT
router.post('/', async (req, res) => {
    const payment = req.body;
    console.log("Payment request received:", payment);

    try {
        // Create a new payment using Mongoose model
        const paymentResult = await Payment.create(payment);
        console.log("Payment created:", paymentResult);

        // Only attempt to delete cart items if cartItems exists and is not empty
        if (payment.cartItems && Array.isArray(payment.cartItems) && payment.cartItems.length > 0) {
            try {
                // Filter out any invalid IDs
                const validCartIds = payment.cartItems
                    .filter(id => id && typeof id === 'string' && id !== 'unknown')
                    .map(id => {
                        try {
                            return new ObjectId(id);
                        } catch (err) {
                            console.error("Invalid ObjectId:", id);
                            return null;
                        }
                    })
                    .filter(id => id !== null);

                if (validCartIds.length > 0) {
                    const deleteResult = await Cart.deleteMany({ _id: { $in: validCartIds } });
                    console.log("Cart items deleted:", deleteResult);
                    res.status(200).json({ paymentResult, deleteResult });
                } else {
                    console.log("No valid cart items to delete");
                    res.status(200).json({ paymentResult, message: "No cart items to delete" });
                }
            } catch (cartError) {
                console.error("Error deleting cart items:", cartError);
                // Still return success since payment was created
                res.status(200).json({ 
                    paymentResult, 
                    cartError: true, 
                    message: "Payment created but failed to delete cart items" 
                });
            }
        } else {
            // No cart items, just return payment result
            console.log("No cart items to delete (package or empty cart)");
            res.status(200).json({ paymentResult });
        }
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get all buffet/catering orders - THIS NEEDS TO BE BEFORE OTHER ROUTES TO AVOID CONFLICT
router.get('/buffet', async (req, res) => {
  try {
    console.log("Fetching buffet orders...");
    const buffetOrders = await Payment.find({ orderType: "buffet" }).sort({ createdAt: -1 });
    console.log(`Found ${buffetOrders.length} buffet orders`);
    res.status(200).json(buffetOrders);
  } catch (error) {
    console.error("Error fetching buffet orders:", error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get latest payment for a user
router.get('/latest', verifyToken, async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }
        
        const result = await Payment.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);
            
        if (!result || result.length === 0) {
            return res.status(404).send({ message: 'No payments found for this user' });
        }
        
        res.send(result[0]);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// get all payment information - MOVED BEFORE :id ROUTE
router.get('/all', async (req, res) => {
    try {
      console.log("Fetching all payments...");
      const payments = await Payment.find({}).sort({ createdAt: -1 });
      console.log(`Found ${payments.length} payments`);
      res.status(200).json(payments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      });
    }
});

// Get payments by user email
router.get('/', verifyToken, async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    try {
        const decodedEmail = req.decoded.email;

        if(email !== decodedEmail){
           res.status(403).json({ message: "Forbidden access!"});
        }
   
       const result = await Payment.find(query).sort({ createdAt: -1 }).exec();
       res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// cancel order - MOVED BEFORE general /:id routes
router.patch('/cancel/:id', verifyToken, async (req, res) => {
    const payId = req.params.id;
    const { email } = req.body;
    
    try {
        // Verify that the user is canceling their own order
        const decodedEmail = req.decoded.email;
        if (email !== decodedEmail) {
            return res.status(403).json({ message: "Forbidden access! You can only cancel your own orders." });
        }
        
        // Find the order and check if it's in a cancellable state
        const order = await Payment.findById(payId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if the order belongs to the user
        if (order.email !== email) {
            return res.status(403).json({ message: "Forbidden access! You can only cancel your own orders." });
        }
        
        // Check if the order is in a cancellable state
        const cancellableStatuses = ["order pending", "confirmed"];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({ 
                message: 'This order cannot be cancelled. Only orders with status "order pending" or "confirmed" can be cancelled.' 
            });
        }
        
        // Update the order status to cancelled
        const updatedOrder = await Payment.findByIdAndUpdate(
            payId,
            { status: "cancelled" },
            { new: true, runValidators: true }
        );
        
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payment by ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Payment.findById(id);
        if (!result) {
            return res.status(404).send({ message: 'Payment not found' });
        }
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// confirm payment status
router.patch('/:id', verifyToken, async (req, res) => {
    const payId = req.params.id;
    const { status } = req.body; // Extract the status from the request body
    try {
        const updatedStatus = await Payment.findByIdAndUpdate(
            payId,
            { status: status }, // Use the extracted status variable
            { new: true, runValidators: true }
        );

        if (!updatedStatus) {
            return res.status(404).json({ message: 'Payment ID not found' });
        }

        res.status(200).json(updatedStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
