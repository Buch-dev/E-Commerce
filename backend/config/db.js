import mongoose from "mongoose";

export const connectMongoDB = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((data) => {
      console.log("MongoDB connected successfully:", data.connection.host);
    })
};
