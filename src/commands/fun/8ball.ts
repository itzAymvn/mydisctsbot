/**
 * 8ball command
 * @module commands/fun/8ball
 * @description Ask the magic 8ball a question
 * @license MIT
 * @version 1.0.0
 */

import { SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"
import { randomBytes } from "crypto"

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
		type Response = {
			response: string
			probability: number
		}

		const responses: Response[] = [
			{ response: "It is certain", probability: 0.05 },
			{ response: "It is decidedly so", probability: 0.05 },
			{ response: "Without a doubt", probability: 0.05 },
			{ response: "Yes, definitely", probability: 0.05 },
			{ response: "You may rely on it", probability: 0.05 },
			{ response: "As I see it, yes", probability: 0.1 },
			{ response: "Most likely", probability: 0.1 },
			{ response: "Outlook good", probability: 0.1 },
			{ response: "Yes", probability: 0.1 },
			{ response: "Signs point to yes", probability: 0.05 },
			{ response: "Reply hazy try again", probability: 0.05 },
			{ response: "Ask again later", probability: 0.05 },
			{ response: "Better not tell you now", probability: 0.05 },
			{ response: "Cannot predict now", probability: 0.05 },
			{ response: "Concentrate and ask again", probability: 0.05 },
			{ response: "Don't count on it", probability: 0.05 },
			{ response: "My reply is no", probability: 0.05 },
			{ response: "My sources say no", probability: 0.05 },
			{ response: "Outlook not so good", probability: 0.05 },
			{ response: "Very doubtful", probability: 0.05 },
		]

		const getRandomNumber = () => {
			const randomBuffer = randomBytes(4)
			const randomNumber = randomBuffer.readUInt32BE(0) / 0xffffffff
			return randomNumber
		}

		const random = getRandomNumber()
		let total = 0

		for (const response of responses) {
			total += response.probability
			if (random <= total) {
				return interaction.reply(response.response)
			}
		}

		return interaction.reply({
			content: "An error occurred while asking the 8ball.",
			ephemeral: true,
		})
	},
}
