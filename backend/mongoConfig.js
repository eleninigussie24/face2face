require("dotenv").config();
const mongoose = require("mongoose");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = isProduction 
  ? process.env.MONGODB_URI 
  : `mongodb://localhost:27017/${process.env.DB_DATABASE || 'faceface_db'}`;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
