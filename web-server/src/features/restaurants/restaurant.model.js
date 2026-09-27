const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        price: {
            type: Number,
            required: true
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

const RestaurantSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        },
        products: {
            type: [ProductSchema],
            default: []
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

module.exports = mongoose.model('Restaurant', RestaurantSchema);
