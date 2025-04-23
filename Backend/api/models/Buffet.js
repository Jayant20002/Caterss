const mongoose = require('mongoose');
const { Schema } = mongoose;

const buffetSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: true,
    },
    eventType: {
        type: String,
        trim: true,
        required: true,
    },
    numberOfGuests: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        trim: true,
        required: true,
    },
    packageName: {
        type: Schema.Types.Mixed, // Can be String or Array
        required: true
    },
    selected: [String],
    specialRequests: String,
    isVeg: Boolean,
    // New fields for tracking payment status
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    paid: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'cod', null],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Buffet = mongoose.model('Buffet', buffetSchema);

module.exports = Buffet;