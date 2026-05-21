// ============================================
// SEED DATA SCRIPT
// ============================================

import bcrypt from "bcryptjs";

import User from "./models/user.model.js";
import Court from "./models/court.model.js";
import Equipment from "./models/equipment.model.js";

export const seedDatabase = async () => {

    await User.deleteMany();
    await Court.deleteMany();
    await Equipment.deleteMany();


    const hashedPassword =
        await bcrypt.hash("123456", 10);


    const admin = await User.create({

        fullName: "Admin",

        email: "admin@gmail.com",

        password: hashedPassword,

        phone: "0900000001",

        role: "ADMIN"

    });


    const user = await User.create({

        fullName: "Nguyen Van A",

        email: "user@gmail.com",

        password: hashedPassword,

        phone: "0900000002",

        role: "USER"

    });


    await Court.insertMany([

        {

            name: "Court A",

            location: "Ho Chi Minh",

            address: "District 1",

            type: "INDOOR",

            images: [
                "https://images.unsplash.com/photo-1"
            ],

            pricePerHour: 200000,

            amenities: [
                "Parking",
                "Shower",
                "Locker"
            ]

        },

        {

            name: "Court B",

            location: "Ho Chi Minh",

            address: "District 7",

            type: "OUTDOOR",

            images: [
                "https://images.unsplash.com/photo-2"
            ],

            pricePerHour: 150000

        }

    ]);


    await Equipment.insertMany([

        {

            name: "Joola Paddle",

            type: "PADDLE",

            quantity: 20,

            availableQuantity: 20,

            rentalType: "HOUR",

            rentalPrice: 50000

        },

        {

            name: "Franklin Ball",

            type: "BALL",

            quantity: 100,

            availableQuantity: 100,

            rentalType: "TURN",

            rentalPrice: 10000

        }

    ]);


    console.log(
        "DATABASE SEEDED SUCCESSFULLY"
    );
};