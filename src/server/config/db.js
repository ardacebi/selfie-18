import mongoose from "mongoose";
import { config } from "dotenv";

const { connect } = mongoose;

config();

export const connectDB = async () => {
  try {
    const conn = await connect(
      process.env.MONGO_URI ||
        `mongodb+srv://aledamb:Jhf7tygg1tYjXKhJ@clustertechwebselfiepro.1x9uk.mongodb.net/Accounts?retryWrites=true&w=majority&appName=ClusterTechWebSelfieProject`,
    );
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error ${error.message}`);
    process.exit(1);
  }
};
