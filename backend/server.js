import app from "./app.js";
import dotenv from "dotenv";
import { connectMongoDB } from "./config/db.js";
dotenv.config({ path: "backend/config/config.env" });
connectMongoDB();

// Handle uncaught exception errors
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught exception errors`);
  process.exit(1);
});
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

// Handle unhandled exceptions
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server is shutting down, due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
