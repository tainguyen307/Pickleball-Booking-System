import mongoose from "mongoose";

const courtSlotSchema = new mongoose.Schema({

    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Court",
        required: true
    },

    date: {
        type: String,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    isBooked: {
        type: Boolean,
        default: false
    },

    isBlocked: {
        type: Boolean,
        default: false
    },

    blockedReason: {
        type: String
    },

    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    }

}, {
    timestamps: true
});


// UNIQUE SLOT
courtSlotSchema.index({
    courtId: 1,
    date: 1,
    startTime: 1
}, {
    unique: true
});

courtSlotSchema.index({
    date: 1,
    isBooked: 1
});

export default mongoose.model(
    "CourtSlot",
    courtSlotSchema
);
