/**
 * Trivia command
 * @module commands/fun/trivia
 * @description Start a trivia game
 * @license MIT
 * @version 1.0.0
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
import { decode } from "he"

// Define the trivia question response type
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

// Define trivia categories and difficulty levels
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

// Extend the String prototype to include a capitalize method
declare global {
	interface String {
		capitalize(): string
	}
}

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1)
}

// Generate the trivia question URL
const generateURL = (category: string, difficulty: string): string => {
	const url = new URL("https://opentdb.com/api.php")
	url.searchParams.append("amount", "1")
	url.searchParams.append("type", "multiple")
	if (category) url.searchParams.append("category", category)
	if (difficulty) url.searchParams.append("difficulty", difficulty)
	return url.toString()
}

// Create an embed for the trivia question
const createQuestionEmbed = (
	category: string,
	difficulty: string,
	expiration: number,
	question: string,
	allAnswers: string[],
	participants: { user: string; answer: string }[] = []
): EmbedBuilder => {
	const participantList = participants.length
		? participants.map((p, index) => `<@${p.user}>`).join(", ")
		: "None"

	const embed = new EmbedBuilder()
		.setTitle("Trivia Question")
		.setDescription(
			`Answer the question by selecting one of the options below.`
		)
		.addFields(
			{ name: "Category", value: category, inline: true },
			{
				name: "Difficulty",
				value: difficulty.capitalize(),
				inline: true,
			},
			{
				name: "Time Remaining",
				value: `<t:${Math.floor(expiration / 1000)}:R>`,
				inline: true,
			},
			{ name: "Participants", value: participantList },
			{ name: "Question", value: question },
			{
				name: "Options",
				value: allAnswers
					.map(
						(answer, index) => `\`${index + 1}.\` ${decode(answer)}`
					)
					.join("\n"),
			}
		)
		.setColor(
			difficulty === "easy"
				? Colors.Green
				: difficulty === "medium"
				? Colors.Yellow
				: Colors.Red
		)
	return embed
}

// Create an embed for the trivia results
const createResultEmbed = (
	category: string,
	difficulty: string,
	question: string,
	correctAnswer: string,
	allAnswers: string[],
	participants: { user: string; answer: string; time: number }[]
): EmbedBuilder => {
	const correctParticipants = participants
		.filter((participant) => participant.answer === correctAnswer)
		.sort((a, b) => a.time - b.time)

	const winner = correctParticipants[0]
	const timeTaken = (time: number) =>
		((time - Date.now() + 30000) / 1000).toFixed(2)

	const embed = new EmbedBuilder()
		.setTitle("Trivia Results")
		.setDescription(`Here are the results of the trivia question.`)
		.addFields(
			{ name: "Category", value: category, inline: true },
			{
				name: "Difficulty",
				value: difficulty.capitalize(),
				inline: true,
			},
			{ name: "Question", value: question },
			{ name: "Correct Answer", value: correctAnswer },
			{ name: "Participants", value: `${participants.length}` },
			{
				name: "Correct Participants",
				value: correctParticipants.length
					? correctParticipants
							.map(
								(participant, index) =>
									`\`${index + 1}.\` <@${
										participant.user
									}> (${timeTaken(participant.time)}s)`
							)
							.join("\n")
					: "None",
			},
			{
				name: "Winner",
				value: winner
					? `<@${winner.user}> (${timeTaken(winner.time)}s)`
					: "None",
			}
		)
		.setColor(
			difficulty === "easy"
				? Colors.Green
				: difficulty === "medium"
				? Colors.Yellow
				: Colors.Red
		)
	return embed
}

// Create buttons for the trivia answers
const createAnswerButtons = (
	allAnswers: string[]
): ActionRowBuilder<ButtonBuilder> => {
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		allAnswers.map((answer, index) => {
			return new ButtonBuilder()
				.setCustomId(`trivia-answer-${index}`)
				.setLabel(`${index + 1}`)
				.setStyle(ButtonStyle.Primary)
		})
	)
	return row
}

// Main command execution
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
					categories.map((category) => ({
						name: category.name.capitalize(),
						value: category.id.toString(),
					}))
				)
		)
		.addStringOption((option) =>
			option
				.setName("difficulty")
				.setRequired(false)
				.setDescription("The difficulty of the trivia question")
				.addChoices(
					difficultyLevels.map((difficulty) => ({
						name: difficulty,
						value: difficulty,
					}))
				)
		),
	guildOnly: true,
	cooldown: 5000,
	async execute(interaction) {
		const questionTimeout = 30 // in seconds
		const options = interaction.options as CommandInteractionOptionResolver
		const categoryOption = options.getString("category") || ""
		const difficultyOption = options.getString("difficulty") || ""

		try {
			await interaction.deferReply()

			const url = generateURL(categoryOption, difficultyOption)
			const response = await fetch(url)
			const data = (await response.json()) as TriviaQuestionResponse

			if (
				data.response_code !== 0 ||
				!data.results.length ||
				!data.results[0]
			) {
				throw new Error(
					"An error occurred while fetching the trivia question. Please try again in a few seconds."
				)
			}

			const questionData = data.results[0]
			const question = decode(questionData.question)
			const category = questionData.category
			const difficulty = questionData.difficulty
			const correctAnswer = questionData.correct_answer
			const incorrectAnswers = questionData.incorrect_answers
			const allAnswers = [...incorrectAnswers, correctAnswer].sort(
				() => Math.random() - 0.5
			)
			const expiration = Date.now() + questionTimeout * 1000

			const embed = createQuestionEmbed(
				category,
				difficulty,
				expiration,
				question,
				allAnswers
			)

			const row = createAnswerButtons(allAnswers)

			const message = await interaction.editReply({
				embeds: [embed],
				components: [row],
			})

			const collector = message.createMessageComponentCollector({
				time: questionTimeout * 1000,
			})

			const participants: {
				user: string
				answer: string
				time: number
			}[] = []

			collector.on("collect", (i: ButtonInteraction) => {
				if (participants.some((p) => p.user === i.user.id)) {
					return i.reply({
						content: "You have already answered.",
						ephemeral: true,
					})
				}

				const answerIndex = parseInt(i.customId.split("-").pop()!, 10)
				const selectedAnswer = allAnswers[answerIndex]

				if (!selectedAnswer) {
					return i.reply({
						content: "Invalid answer.",
						ephemeral: true,
					})
				}

				participants.push({
					user: i.user.id,
					answer: selectedAnswer,
					time: Date.now(),
				})

				const updatedEmbed = createQuestionEmbed(
					category,
					difficulty,
					expiration,
					question,
					allAnswers,
					participants
				)

				message.edit({
					embeds: [updatedEmbed],
				})

				return i.reply({ content: "Answer recorded.", ephemeral: true })
			})

			collector.on("end", async () => {
				const resultEmbed = createResultEmbed(
					category,
					difficulty,
					question,
					correctAnswer,
					allAnswers,
					participants
				)

				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					allAnswers.map((answer, index) => {
						const participantsAnswered = participants.filter(
							(p) => p.answer === answer
						).length

						return new ButtonBuilder()
							.setCustomId(`trivia-answer-${index}`)
							.setLabel(`${index + 1} (${participantsAnswered})`)
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
					})
				)

				return message.edit({
					embeds: [resultEmbed],
					components: [row],
				})
			})

			return
		} catch (error: any) {
			const embed = new EmbedBuilder()
				.setTitle("Error")
				.setDescription(`An error occurred: ${error.message}`)
				.setColor(Colors.Red)
				.setTimestamp()

			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					embeds: [embed],
					ephemeral: true,
				})
			} else {
				return interaction.reply({ embeds: [embed], ephemeral: true })
			}
		}
	},
}
