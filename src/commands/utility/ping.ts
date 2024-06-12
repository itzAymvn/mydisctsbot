/**
 * Ping command
 * @module commands/utility/ping
 * @description Replies with Pong!
 * @license MIT
 * @version 1.0.0
 */

import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with the bot's ping!"),
	async execute(interaction) {
		// Save the timestamp when the interaction was sent
		const sentTimestamp = Date.now()

		// Send a message to the user that the bot is calculating the latency
		await interaction.reply({
			content:
				"🏓 Pinging... This might take a few seconds, please wait.",
		})

		// Calculate the latency
		const latency = Date.now() - sentTimestamp

		// Create a new embed
		const embed = new EmbedBuilder()
			.setTitle("Pong!")
			.setDescription(`🏓 Pong! The bot's latency is ${latency}ms.`)
			.setColor("#5865F2")
			.setTimestamp()
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL(),
			})

		// Edit the reply to include the embed and the button
		return await interaction.editReply({
			content: "",
			embeds: [embed],
		})
	},
}
