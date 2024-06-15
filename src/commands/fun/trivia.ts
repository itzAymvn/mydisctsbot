/**
 * Trivia command
 * @module commands/fun/trivia
 * @description Start a trivia game
 * @license MIT
 * @version 1.0.0
 */

import {
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	Message,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"

type TriviaQuestionResponse = {
	response_code: number
	results: {
		type: string
		difficulty: string
		category: string
		question: string
		correct_answer: string
		incorrect_answers: string[]
	}[]
}

const categories = [
	{ id: 9, name: "General Knowledge" },
	{ id: 10, name: "Entertainment: Books" },
	{ id: 11, name: "Entertainment: Film" },
	{ id: 12, name: "Entertainment: Music" },
	{ id: 13, name: "Entertainment: Musicals & Theatres" },
	{ id: 14, name: "Entertainment: Television" },
	{ id: 15, name: "Entertainment: Video Games" },
	{ id: 16, name: "Entertainment: Board Games" },
	{ id: 17, name: "Science & Nature" },
	{ id: 18, name: "Science: Computers" },
	{ id: 19, name: "Science: Mathematics" },
	{ id: 20, name: "Mythology" },
	{ id: 21, name: "Sports" },
	{ id: 22, name: "Geography" },
	{ id: 23, name: "History" },
	{ id: 24, name: "Politics" },
	{ id: 25, name: "Art" },
	{ id: 26, name: "Celebrities" },
	{ id: 27, name: "Animals" },
	{ id: 28, name: "Vehicles" },
	{ id: 29, name: "Entertainment: Comics" },
	{ id: 30, name: "Science: Gadgets" },
	{ id: 31, name: "Entertainment: Japanese Anime & Manga" },
	{ id: 32, name: "Entertainment: Cartoon & Animations" },
]

const difficultyLevels = ["easy", "medium", "hard"]

const generateURL = (category: string, difficulty: string) => {
	const url = new URL("https://opentdb.com/api.php")
	url.searchParams.append("amount", "1")
	url.searchParams.append("type", "multiple")
	if (category !== "") {
		url.searchParams.append("category", category)
	}

	if (difficulty !== "") {
		url.searchParams.append("difficulty", difficulty)
	}

	return url.toString()
}

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("trivia")
		.setDescription("Start a trivia game")
		.addStringOption((option) =>
			option
				.setName("category")
				.setDescription("The category of the trivia question")
				.setRequired(false)
				.addChoices(
					categories.map((category) => {
						return {
							name: category.name,
							value: category.id.toString(),
						}
					})
				)
		)
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setRequired(false)
				.setDescription("The difficulty of the trivia question")
				.addChoices(
					difficultyLevels.map((difficulty) => {
						return {
							name: difficulty,
							value: difficulty,
						}
					})
				)
		),

	async execute(interaction) {
		const questionTimeout = 15 // in seconds
		const options = interaction.options as CommandInteractionOptionResolver
		const categoryOption = options.getString("category") || ""
		const difficultyOption = options.getString("difficulty") || ""

		try {
			const url = generateURL(categoryOption, difficultyOption)
			const response = await fetch(url)
			const data = (await response.json()) as TriviaQuestionResponse
			const questionData = data.results[0]
			if (!questionData) {
				throw new Error("No trivia question data found")
			}

			const question = questionData.question
			const category = questionData.category

			const difficulty =
				questionData.difficulty.charAt(0).toUpperCase() +
				questionData.difficulty.slice(1)
			const correctAnswer = questionData.correct_answer
			const incorrectAnswers = questionData.incorrect_answers
			const allAnswers = [...incorrectAnswers, correctAnswer].sort(
				() => Math.random() - 0.5
			)

			// Create the trivia question message
			const embed = new EmbedBuilder()
				.setTitle("Trivia Question")
				.setDescription(
					`\`•\` **Category:** ${category}\n` +
						`\`•\` **Difficulty:** ${difficulty}\n` +
						`\`•\` **Question:** ${question.replace(
							/&quot;/g,
							'"'
						)}\n\n` +
						allAnswers
							.map((answer, index) => {
								return `\`${index + 1}.\` ${answer}`
							})
							.join("\n")
				)
				.setColor(
					difficulty === "easy"
						? Colors.Green
						: difficulty === "medium"
						? Colors.Yellow
						: Colors.Red
				)

			await interaction.reply({ embeds: [embed], fetchReply: true })

			// Collect user's answer
			const filter = (response: Message) => {
				const choice = parseInt(response.content)
				return (
					response.author.id === interaction.user.id &&
					!isNaN(choice) &&
					choice > 0 &&
					choice <= allAnswers.length
				)
			}

			return await interaction
				.channel!.awaitMessages({
					filter,
					max: 1,
					time: questionTimeout * 1000,
					errors: ["time"],
				})
				.then((collected) => {
					const userAnswer = collected.first()!.content
					const userChoice = allAnswers[parseInt(userAnswer) - 1]

					// Check if the answer is correct
					if (userChoice === correctAnswer) {
						return interaction.followUp("Correct! 🎉")
					} else {
						return interaction.followUp(
							`❌ Incorrect. The correct answer was: ${correctAnswer}`
						)
					}
				})
				.catch(() => {
					return interaction.followUp(
						"Time's up! ⏰\nThe correct answer was: " +
							correctAnswer
					)
				})
		} catch (error) {
			if (interaction.replied || interaction.deferred) {
				return
			} else {
				return interaction.reply({
					content:
						"An error occurred while fetching the trivia question.",
					ephemeral: true,
				})
			}
		}
	},
}
