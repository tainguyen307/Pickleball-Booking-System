import mongoose from "mongoose";

const courtSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    location: {
        type: String,
        required: true
    },

    address: {
        type: String
    },

    type: {
        type: String,
        enum: [
            "INDOOR",
            "OUTDOOR"
        ],
        required: true
    },

    images: [
        {
            imageUrl: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],

    description: {
        type: String
    },

    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    },

    openTime: {
        type: String,
        default: "06:00"
    },

    closeTime: {
        type: String,
        default: "22:00"
    },

    slotDuration: {
        type: Number,
        default: 60
    },

    amenities: [{
        type: String
    }],

    status: {
        type: String,
        enum: [
            "AVAILABLE",
            "MAINTENANCE",
            "HIDDEN"
        ],
        default: "AVAILABLE"
    }

}, {
    timestamps: true
});


// INDEXES
courtSchema.index({ location: 1 });
courtSchema.index({ type: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({
    location: "text",
    name: "text"
});

export default mongoose.model(
    "Court",
    courtSchema
);
