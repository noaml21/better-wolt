const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

const OrderSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        restaurant: {
            type: String,
            required: true
        },
        restaurantName: {
            type: String,
            default: ''
        },
        products: {
            type: [String],
            default: []
        },
        orderItems: {
            type: [OrderItemSchema],
            default: []
        },
        items: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            default: 'בדרך 🛵'
        },
        date: {
            type: String,
            default: ''
        },
        startTime: {
            type: Number,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

module.exports = mongoose.model('Order', OrderSchema);
