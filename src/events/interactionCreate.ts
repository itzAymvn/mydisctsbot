/**
 * This event is triggered whenever the interactionCreate event is fired.
 * @param {Client} client - The client.
 * @param {Interaction} interaction - The interaction.
 * @event interactionCreate
 * @license MIT
 */

import { Client, Events, Interaction } from "discord.js"
import { TEvent } from "../types"

export default <TEvent>{
	name: Events.InteractionCreate,
	async execute(client: Client, interaction: Interaction) {
		// Check if the interaction is not a command
		if (!interaction.isChatInputCommand()) return

		// Check if the command is not registered
		const command = interaction.client.commands.get(interaction.commandName)
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			)
			return
		}

		// Try to execute the command
		try {
			await command.execute(interaction)
		} catch (error) {
			console.error(error)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				})
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				})
			}
		}
	},
}
