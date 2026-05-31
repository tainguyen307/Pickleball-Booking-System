import mongoose from "mongoose";

const maintenanceSchema =
    new mongoose.Schema({

        targetType: {
            type: String,
            enum: [
                "COURT",
                "EQUIPMENT"
            ],
            required: true
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        severity: {
            type: String,
            enum: [
                "LOW",
                "MEDIUM",
                "HIGH"
            ],
            default: "LOW"
        },

        status: {
            type: String,
            enum: [
                "REPORTED",
                "IN_PROGRESS",
                "COMPLETED"
            ],
            default: "REPORTED"
        },

        maintenanceDate: {
            type: Date
        },

        completedDate: {
            type: Date
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    }, {
        timestamps: true
    });


// INDEXES
maintenanceSchema.index({
    targetType: 1
});

maintenanceSchema.index({
    status: 1
});

export default mongoose.model(
    "Maintenance",
    maintenanceSchema
);