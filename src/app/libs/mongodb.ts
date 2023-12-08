import mongoose from "mongoose";

const MONGO_URL = "mongodb://127.0.0.1/auth-next-13-24";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(error);
    }
};