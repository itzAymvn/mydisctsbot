import { REST, Routes } from "discord.js"
import fs from "fs"
import path from "path"
import { config } from "dotenv"
config()

// Grab the token and client ID from the .env file
const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_APP_ID
const guildId = process.env.DISCORD_GUILD_ID

// Check if all the required environment variables are set
if (!token || !clientId || !guildId) {
	console.error(
		"Missing one or more required environment variables: DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID"
	)
	process.exit(1)
}

// Create an array to hold all the commands
const commands = []

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands")
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js") || file.endsWith(".ts"))
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath).default
		if ("data" in command && "execute" in command) {
			commands.push(command.data)
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			)
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)

// and deploy your commands!
;(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		})

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
