/**
 * 8ball command
 * @module commands/fun/8ball
 * @description Ask the magic 8ball a question
 * @license MIT
 * @version 1.0.0
 */

import { SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("8ball")
		.setDescription("Ask the magic 8ball a question")
		.addStringOption((option) =>
			option
				.setName("question")
				.setDescription("The question you want to ask the 8ball")
				.setRequired(true)
		),

	async execute(interaction) {
		const responses = [
			"It is certain.",
			"It is decidedly so.",
			"Without a doubt.",
			"Yes - definitely.",
			"You may rely on it.",
			"As I see it, yes.",
			"Most likely.",
			"Outlook good.",
			"Yes.",
			"Signs point to yes.",
			"Reply hazy, try again.",
			"Ask again later.",
			"Better not tell you now.",
			"Cannot predict now.",
			"Concentrate and ask again.",
			"Don't count on it.",
			"My reply is no.",
			"My sources say no.",
			"Outlook not so good.",
			"Very doubtful.",
		]

		const response = responses[Math.floor(Math.random() * responses.length)]

		if (!response) {
			return interaction.reply({
				content: "I'm sorry, I couldn't get a response from the 8ball.",
				ephemeral: true,
			})
		}

		return interaction.reply({
			content: response,
		})
	},
}
