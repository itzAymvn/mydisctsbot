// Require the necessary modules
import { Client, Collection, GatewayIntentBits } from "discord.js"
import { config } from "dotenv"
import path from "path"
import fs from "fs"

// Load environment variables from a .env file
config()

// Functions to load all the events and commands
const loadCommands = async () => {
	// Get the path to the commands folder
	const foldersPath = path.join(__dirname, "commands")
	const commandFolders = fs.readdirSync(foldersPath)

	// Loop through all the folders in the commands folder
	for (const folder of commandFolders) {
		// Get the path to the current folder
		const commandsPath = path.join(foldersPath, folder)
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

		// Loop through all the files in the current folder
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file)
			const command = require(filePath)

			// Set a new item in the Collection with the key as the command name and the value as the exported module
			if ("default" in command) {
				client.commands.set(command.default.data.name, command.default)
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "default" property.`
				)
			}
		}
	}

	console.log(
		`[INFO] Loaded ${
			client.commands.size === 0
				? "no"
				: client.commands.size === 1
				? "one"
				: client.commands.size
		} command${client.commands.size === 1 ? "" : "s"}.`
	)
}
const loadEvents = async () => {
	let totalEvents = 0

	const eventsPath = path.join(__dirname, "events")
	const eventFiles = fs
		.readdirSync(eventsPath)
		.filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file)
		const event = require(filePath)

		if ("default" in event) {
			if (event.default.once) {
				totalEvents++

				client.once(event.default.name, (...args) =>
					event.default.execute(client, ...args)
				)
			} else {
				totalEvents++
				client.on(event.default.name, (...args) =>
					event.default.execute(client, ...args)
				)
			}
		} else {
			console.log(
				`[WARNING] The event at ${filePath} is missing a required "default" property.`
			)
		}
	}

	console.log(
		`[INFO] Loaded ${
			totalEvents === 0 ? "no" : totalEvents === 1 ? "one" : totalEvents
		} event${totalEvents === 1 ? "" : "s"}.`
	)
}

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})

// Initialize a new Collection to store the commands
client.commands = new Collection()

// Main function to log in to Discord and load all the commands and events
const main = async () => {
	// Log in to Discord with your client's token
	if (!process.env.DISCORD_TOKEN) {
		throw new Error("Please provide a valid token in the .env file")
	}

	// Load all the commands and events
	await loadEvents()
	await loadCommands()

	// Log in to Discord
	await client.login(process.env.DISCORD_TOKEN)
}

// Call the main function to start the bot
main()
