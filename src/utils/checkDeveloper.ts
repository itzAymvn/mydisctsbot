import { config } from "dotenv"

// Load environment variables from the .env file
config()

const developerIds = process.env?.DEVELOPER_IDS?.split(",") || []

const isDeveloper = (userId: string): boolean => {
	return developerIds.includes(userId)
}

export default isDeveloper
