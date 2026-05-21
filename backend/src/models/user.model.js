import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    phone: {
        type: String,
        trim: true
    },

    avatar: {
        type: String,
        default: null
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "BLOCKED"
        ],
        default: "ACTIVE"
    },

    lastLogin: {
        type: Date
    }

}, {
    timestamps: true
});


// INDEXES
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default mongoose.model(
    "User",
    userSchema
);
