const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://localhost:27017/primesound");

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("DB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;