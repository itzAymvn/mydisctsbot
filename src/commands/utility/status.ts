/**
 * Status Command
 * @module commands/utility/status
 * @description Replies with some information about the bot's status
 * @license MIT
 * @version 1.0.0
 */

import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"
import { execSync } from "child_process"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("status")
		.setDescription("Replies with some information about the bot's status"),
	async execute(interaction) {
		// Get epoch time when the bot was started
		const botUpSince = Math.floor(
			interaction.client.readyAt.getTime() / 1000
		)
		const memoryUsage =
			(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB"
		const latency = interaction.client.ws.ping
		const guildCount = interaction.client.guilds.cache.size
		const lastUpdated = execSync("git log -1 --format=%cd")
			.toString()
			.trim()
		const lastUpdatedTimestamp = Math.floor(
			new Date(lastUpdated).getTime() / 1000
		)

		// Create a new embed
		const embed = new EmbedBuilder()
			.setTitle("Bot Status")
			.setDescription(
				"Here is some information about the bot's status:" +
					"\n\n" +
					`\`•\` Bot Uptime: <t:${botUpSince}:R>\n` +
					`\`•\` Memory Usage: \`${memoryUsage}\`\n` +
					`\`•\` Latency: \`${latency}ms\`\n` +
					`\`•\` Guilds: \`${guildCount} servers\`\n` +
					`\`•\` Last Updated: <t:${lastUpdatedTimestamp}:D> at <t:${lastUpdatedTimestamp}:T>`
			)
			.setColor("#5865F2")
			.setTimestamp()
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL(),
			})

		// Reply with the embed
		return await interaction.reply({
			embeds: [embed],
		})
	},
}
