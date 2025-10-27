require("dotenv").config();
const mongoose = require("mongoose");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = isProduction 
  ? process.env.MONGODB_URI 
  : `mongodb://localhost:27017/${process.env.DB_DATABASE || 'faceface_db'}`;

const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("Connection string prefix:", connectionString.substring(0, 20) + "...");
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:");
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    if (isProduction) {
      console.error("\n🔧 TROUBLESHOOTING:");
      console.error("1. Check if MONGODB_URI is set in environment variables");
      console.error("2. Verify MongoDB Atlas network access allows 0.0.0.0/0");
      console.error("3. Verify username/password in connection string");
      console.error("4. Check if IP whitelist in MongoDB Atlas is correct");
    }
    
    process.exit(1);
  }
};

module.exports = { connectDB };
