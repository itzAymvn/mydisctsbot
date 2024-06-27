/**
 * Trivia Leaderboard Command
 * @module commands/fun/trivia-leaderboard
 * @description Display the trivia leaderboard
 * @license MIT
 * @version 1.0.0
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
import Trivia from "../../database/models/Trivia"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("trivia-leaderboard")
		.setDescription("Display the trivia leaderboard"),

	async execute(interaction) {
		let currentPage = 1
		let pageSize = 5
		let totalDocs = await Trivia.countDocuments()
		let totalPages = Math.ceil(totalDocs / pageSize)

		const generateEmbed = async (page: number) => {
			const users = await Trivia.find()
				.sort({ points: -1 })
				.limit(pageSize)
				.skip((page - 1) * pageSize)

			if (users.length === 0) {
				return {
					success: false,
					error: "No trivia data found",
				}
			}

			const formattedUsers = users.map(async (user, idx) => {
				const member = await interaction.guild!.members.fetch(
					user.userId
				)

				/*
                    1. <@123456789> - 100 points
                    ```bash
                    Total correct answers: 10
                    Correct easy answers: 5
                    Correct medium answers: 3
                    Correct hard answers: 2
                    ```
                    2. <@987654321> - 50 points

                */

				const username = member
					? member.toString()
					: `**${user.userId}**`

				return `**${
					idx + 1 + pageSize * (page - 1)
				}.** ${username} - **${
					user.points
				}** points\n\`\`\`bash\n↳ Correct easy answers: ${
					user.totalEasy
				}\n↳ Correct medium answers: ${
					user.totalMedium
				}\n↳ Correct hard answers: ${user.totalHard}\n\`\`\``
			})

			const embed = new EmbedBuilder()
				.setTitle("Trivia Leaderboard")
				.setColor(Colors.Blurple)
				.setFooter({
					text: `Page ${page}/${totalPages}`,
				})
				.setDescription((await Promise.all(formattedUsers)).join("\n"))

			return {
				success: true,
				embed: embed,
			}
		}

		const initialEmbed = await generateEmbed(currentPage)
		if (!initialEmbed.success) {
			return interaction.reply({
				content: initialEmbed.error,
				ephemeral: true,
			})
		}

		// Add Buttons to the initial embed
		const previousButton = new ButtonBuilder()
			.setCustomId(`previousTriviaPage`)
			.setLabel("Previous")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === 1)
			.setEmoji("⬅️")

		const nextButton = new ButtonBuilder()
			.setCustomId(`nextTriviaPage`)
			.setLabel("Next")
			.setStyle(ButtonStyle.Primary)
			.setDisabled(currentPage === totalPages)
			.setEmoji("➡️")

		const row = new ActionRowBuilder().addComponents(
			previousButton,
			nextButton
		) as any

		// Send the initial embed
		const initMessage = await interaction.reply({
			embeds: [initialEmbed.embed!],
			components: [row],
		})

		// Create a collector
		const collector = initMessage.createMessageComponentCollector({
			time: 60000,
		})

		collector.on("collect", async (buttonInteraction) => {
			if (buttonInteraction.user.id !== interaction.user.id) {
				return buttonInteraction.reply({
					content:
						"You are not allowed to interact with this message",
					ephemeral: true,
				})
			}

			// Handle the button ID
			switch (buttonInteraction.customId) {
				case "previousTriviaPage":
					currentPage--
					break
				case "nextTriviaPage":
					currentPage++
					break
				default:
					break
			}

			row.components[0].setDisabled(currentPage === 1)
			row.components[1].setDisabled(currentPage === totalPages)

			// Regenerate the embed
			const newEmbed = await generateEmbed(currentPage)
			if (!newEmbed.success) {
				return buttonInteraction.reply({
					content: newEmbed.error,
					ephemeral: true,
				})
			}

			// Update the message
			return await buttonInteraction.update({
				embeds: [newEmbed.embed!],
				components: [row],
			})
		})

		collector.on("end", async () => {
			row.components[0].setDisabled(true)
			row.components[1].setDisabled(true)

			return await initMessage.edit({
				components: [row],
			})
		})

		return
	},
}
