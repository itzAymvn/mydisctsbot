// Require the necessary modules
import { Client, Collection, GatewayIntentBits } from "discord.js"
import connectDB from "./database"
import { config } from "dotenv"
import path from "path"
import fs from "fs"
import { TButton, TTask } from "./types"

// Load environment variables from a .env file
config()

// Functions to load all the events and commands and tasks and button
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
const loadButtons = async () => {
	const buttonsPath = path.join(__dirname, "events/buttons")
	const buttonFiles = fs
		.readdirSync(buttonsPath)
		.filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

	for (const file of buttonFiles) {
		const filePath = path.join(buttonsPath, file)
		const button: TButton = require(filePath).default

		if (!button.data && !button.execute) {
			return console.log(
				`[WARNING] The button at ${filePath} is missing a required "data" and "execute" property.`
			)
		}

		const btn = button.data.toJSON() as any
		client.buttons.set(btn.custom_id, button)
	}

	console.log(
		`[INFO] Loaded ${
			client.buttons.size === 0
				? "no"
				: client.buttons.size === 1
				? "one"
				: client.buttons.size
		} button${client.buttons.size === 1 ? "" : "s"}.`
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
const loadTasks = async () => {
	const tasksPath = path.join(__dirname, "tasks")
	const taskFiles = fs
		.readdirSync(tasksPath)
		.filter((file) => file.endsWith(".ts") || file.endsWith(".js"))

	for (const file of taskFiles) {
		const filePath = path.join(tasksPath, file)
		const task: TTask = require(filePath).default

		if (task.interval === null) {
			task.execute(client)
		} else {
			// Run once and then set the interval
			task.execute(client)
			setInterval(() => task.execute(client), task.interval)
		}
	}

	console.log(
		`[INFO] Loaded ${
			taskFiles.length === 0
				? "no"
				: taskFiles.length === 1
				? "one"
				: taskFiles.length
		} task${taskFiles.length === 1 ? "" : "s"}.`
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

// Initialize a new Collection to store the commands and buttons
client.commands = new Collection()
client.buttons = new Collection()

// Main function to log in to Discord and load all the commands and events
const main = async () => {
	// Log in to Discord with your client's token
	if (!process.env.DISCORD_TOKEN) {
		throw new Error("Please provide a valid token in the .env file")
	}

	// Load all the commands and events and tasks
	await loadEvents()
	await loadButtons()
	await loadCommands()
	await loadTasks()

	// Log in to Discord
	await client.login(process.env.DISCORD_TOKEN)
}

// Call the main function to start the bot
connectDB()
	.then(() => main())
	.catch(console.error)
