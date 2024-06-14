/**
 * Leave Server Command
 * @module commands/developer/leaveServer
 * @description Leave the server
 * @license MIT
 * @version 1.0.0
 */

import {
	CommandInteractionOptionResolver,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("leave-server")
		.setDescription("Leave the server")
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("The server to leave")
				.setRequired(true)
				.setAutocomplete(true)
		),

	devsOnly: true,
	async autocomplete(interaction, client) {
		const guilds = client.guilds.cache
		const focused = (
			interaction.options as CommandInteractionOptionResolver
		)
			.getFocused()
			.toLowerCase()

		if (!focused) {
			return interaction.respond(
				guilds
					.map((guild) => ({
						name: guild.name,
						value: guild.id,
					}))
					.slice(0, guilds.size > 25 ? 25 : guilds.size)
			)
		}

		const filtered = guilds.filter((guild) =>
			guild.name.toLowerCase().includes(focused)
		)

		const options =
			filtered
				.map((guild) => ({
					name: guild.name,
					value: guild.id,
				}))
				.slice(0, filtered.size > 25 ? 25 : filtered.size) || []

		return interaction.respond(options)
	},
	async execute(interaction) {
		const guildId = (
			interaction.options as CommandInteractionOptionResolver
		).getString("server", true)

		const guild = interaction.client.guilds.cache.get(guildId)
		if (!guild) {
			return await interaction.reply({
				content: "I am not in that server.",
				ephemeral: true,
			})
		}

		try {
			await guild.leave()
			return await interaction.reply({
				content: `Successfully left **${guild.name}**.`,
				ephemeral: true,
			})
		} catch (error) {
			console.error(error)
			return await interaction.reply({
				content: "An error occurred while leaving the server.",
				ephemeral: true,
			})
		}
	},
}
