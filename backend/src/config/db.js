import mongoose from "mongoose";

const connectDb = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

export default connectDb;
