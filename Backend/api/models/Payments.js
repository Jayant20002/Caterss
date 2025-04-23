const mongoose = require('mongoose');
const { Schema } = mongoose;
const paymentSchema = new Schema ({
    transitionId: String,
    email: String,
    price: Number, 
    quantity: Number,
    status: String,
    itemsName: Array,
    cartItems: Array,
    menuItems: Array,
    // Payment method field (online or cod)
    paymentMethod: {
        type: String,
        enum: ['online', 'cod'],
        default: 'online'
    },
    // Order type field
    orderType: {
        type: String,
        enum: ['regular', 'buffet'],
        default: 'regular'
    },
    // Buffet/catering specific fields
    cateringType: String,
    eventType: String,
    numberOfGuests: Number,
    eventDate: String,
    eventTime: String,
    selected: Array,
    packageName: String,
    customerInfo: Object,
    createdAt: { 
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;