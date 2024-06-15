/**
 * ASCII art command
 * @module commands/fun/ascii
 * @description Generate ASCII art from text
 * @license MIT
 * @version 1.0.0
 */

import {
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import figlet from "figlet"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("ascii")
		.setDescription("Generate ASCII art from text")
		.addStringOption((option) =>
			option
				.setName("text")
				.setDescription("The text you want to convert to ASCII art")
				.setMinLength(1)
				.setMaxLength(20)
				.setRequired(true)
		),

	async execute(interaction) {
		const text = (
			interaction.options as CommandInteractionOptionResolver
		).getString("text")

		if (!text) {
			return interaction.reply({
				content: "Please provide some text to convert to ASCII art.",
				ephemeral: true,
			})
		}

		const embed = new EmbedBuilder()
		embed.setTitle("ASCII Art")

		figlet(
			text,
			{
				font: "Standard",
				horizontalLayout: "default",
				verticalLayout: "default",
				width: 80,
				whitespaceBreak: true,
			},
			(err, asciiArt) => {
				if (err) {
					embed.setDescription(
						"An error occurred while generating ASCII art."
					)
					embed.setColor(Colors.Red)
					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					})
				}

				if (!asciiArt) {
					embed.setDescription("No ASCII art was generated.")
					embed.setColor(Colors.Red)
					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					})
				}

				if (asciiArt.length > 2000) {
					embed.setDescription(
						"The ASCII art is too long to send in a single message."
					)
					embed.setColor(Colors.Red)
					return interaction.reply({
						embeds: [embed],
						ephemeral: true,
					})
				}

				return interaction.reply(
					"Here is your ASCII art:\n```" + asciiArt + "```"
				)
			}
		)

		return
	},
}
