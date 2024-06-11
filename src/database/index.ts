/**
 * Connect to MongoDB
 * @returns void
 * @version 1.0.0
 */

import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectDB = async (): Promise<void> => {
	try {
		await mongoose.connect(process.env.MONGO_URI!)
		console.log("MongoDB connected")
	} catch (error) {
		console.error("Error connecting to MongoDB", error)
		process.exit(1)
	}
}

export default connectDB
