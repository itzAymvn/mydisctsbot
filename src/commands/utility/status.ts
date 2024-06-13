/**
 * Status Command
 * @module commands/utility/status
 * @description Replies with some information about the bot's status
 * @license MIT
 * @version 1.0.0
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
import { execSync } from "child_process"
import packageJson from "../../../package.json"

const getLatestCommit = (githubLink: string) => {
	try {
		const commitHash = execSync("git rev-parse HEAD").toString().trim()
		const commitMessage = execSync("git log -1 --pretty=%B")
			.toString()
			.trim()
		const commitAuthor = execSync("git log -1 --pretty=%an")
			.toString()
			.trim()
		const commitDate = execSync("git log -1 --pretty=%cd").toString().trim()
		const commitLink = `${githubLink}/commit/${commitHash}`

		return {
			success: true,
			hash: commitHash,
			message: commitMessage,
			author: commitAuthor,
			date: commitDate,
			link: commitLink,
		}
	} catch (error) {
		return {
			success: false,
		}
	}
}

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

		const lastCommit = getLatestCommit(packageJson.repository.url)

		const githubButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel("GitHub")
			.setURL(packageJson.repository.url)

		const latestCommit = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel("Latest Commit")
			.setDisabled(!lastCommit.success)
			.setURL(
				lastCommit.success ? lastCommit.link! : "https://github.com"
			)

		const updateStatusButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Primary)
			.setLabel("Update Status")
			.setCustomId("updateStatus")
			.setEmoji("🔄")

		const row = new ActionRowBuilder().addComponents(
			githubButton,
			latestCommit,
			updateStatusButton
		) as any

		// Reply with the embed
		return await interaction.reply({
			embeds: [embed],
			components: [row],
		})
	},
}
