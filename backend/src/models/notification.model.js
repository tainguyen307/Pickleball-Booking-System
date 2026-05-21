import mongoose from "mongoose";

const notificationSchema =
    new mongoose.Schema({

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "BOOKING",
                "REMINDER",
                "MAINTENANCE",
                "PAYMENT"
            ],
            default: "BOOKING"
        },

        isRead: {
            type: Boolean,
            default: false
        }

    }, {
        timestamps: true
    });


// INDEXES
notificationSchema.index({
    userId: 1
});

notificationSchema.index({
    isRead: 1
});

export default mongoose.model(
    "Notification",
    notificationSchema
);