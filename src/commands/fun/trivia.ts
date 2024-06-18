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

declare global {
	interface String {
		capitalize(): string
	}
}

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1)
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
	guildOnly: true,
	cooldown: 5000,
	async execute(interaction) {
		const questionTimeout = 30 // in seconds
		const options = interaction.options as CommandInteractionOptionResolver
		const categoryOption = options.getString("category") || ""
		const difficultyOption = options.getString("difficulty") || ""

		try {
			// Defer the response to avoid the 3 second response timeout
			await interaction.deferReply()

			const url = generateURL(categoryOption, difficultyOption)
			const response = await fetch(url)

			const data = (await response.json()) as TriviaQuestionResponse
			if (
				data.response_code !== 0 ||
				data.results.length === 0 ||
				!data.results[0]
			) {
				throw new Error(
					"An error occurred while fetching the trivia question. Please try again in a few seconds."
				)
			}

			const questionData = data.results[0]
			const question = decode(questionData.question)
			const category = questionData.category

			const difficulty = questionData.difficulty.capitalize()
			const correctAnswer = questionData.correct_answer
			const incorrectAnswers = questionData.incorrect_answers
			const allAnswers = [...incorrectAnswers, correctAnswer].sort(
				() => Math.random() - 0.5
			)
			const expiration = Date.now() + questionTimeout * 1000

			const categoryString = `\`•\` **Category:** ${category}\n`
			const difficultyString = `\`•\` **Difficulty:** ${difficulty}\n`
			const timeString = `\`•\` **Time:** <t:${Math.floor(
				expiration / 1000
			)}:R>\n`
			const timesupString = `\`•\` **Time's up!**\n`
			const questionString = `\`•\` **Question:** ${question}\n`
			const allAnswersString = allAnswers
				.map((answer, index) => {
					return `\`${index + 1}.\` ${answer}`
				})
				.join("\n")

			// Create the trivia question message
			const embed = new EmbedBuilder()
				.setTitle("Trivia Question")
				.setDescription(
					categoryString +
						difficultyString +
						timeString +
						questionString +
						allAnswersString
				)
				.setColor(
					difficulty === "easy"
						? Colors.Green
						: difficulty === "medium"
						? Colors.Yellow
						: Colors.Red
				)

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				allAnswers.map((answer, index) => {
					return new ButtonBuilder()
						.setCustomId(`trivia-answer-${index}`)
						.setLabel((index + 1).toString())
						.setStyle(ButtonStyle.Primary)
				})
			)

			const message = await interaction.editReply({
				embeds: [embed],
				components: [row],
			})

			type TParticipant = {
				user: string // the user who answered
				answer: string // the index of the answer
				time: number // when the user answered
			}
			const participants: TParticipant[] = []

			// Give everyone 30 seconds to answer the question
			const filter = (i: any) => i.customId.startsWith("trivia-answer")
			const collector = message.createMessageComponentCollector({
				filter,
				time: questionTimeout * 1000,
			})

			collector.on("collect", (i: ButtonInteraction) => {
				// if user has already answered, ignore
				if (
					participants.some(
						(participant) => participant.user === i.user.id
					)
				) {
					return i.reply({
						content: `You have already answered the question!`,
						ephemeral: true,
					})
				}

				const answerIndex = parseInt(i.customId.split("-")[2]!)
				const answer = allAnswers[answerIndex]
				if (!answer) {
					return i.reply({
						content: `Invalid answer!`,
						ephemeral: true,
					})
				}

				participants.push({
					user: i.user.id,
					answer: answer,
					time: Date.now(),
				})

				// Update the message to show total participants (real-time)
				const totalParticipants = participants.length
				const totalParticipantsString = `\`•\` **Participants:** ${totalParticipants}\n`

				const embed = new EmbedBuilder()
					.setTitle("Trivia Question")
					.setDescription(
						categoryString +
							difficultyString +
							timeString +
							totalParticipantsString +
							questionString +
							allAnswersString
					)
					.setColor(
						difficulty === "easy"
							? Colors.Green
							: difficulty === "medium"
							? Colors.Yellow
							: Colors.Red
					)

				message.edit({
					embeds: [embed],
					components: [row],
				})

				// Tell the user that their answer was recorded
				return i.reply({
					content: `Your answer has been recorded!`,
					ephemeral: true,
				})
			})

			collector.on("end", (c, r) => {
				if (r !== "time") return

				// if no participants, return
				if (participants.length === 0) {
					const embed = new EmbedBuilder()
						.setTitle("Trivia Question")
						.setDescription(
							categoryString +
								difficultyString +
								timesupString +
								questionString +
								allAnswersString +
								`\n\n**NO PARTICIPANTS**`
						)
						.setColor(
							difficulty === "easy"
								? Colors.Green
								: difficulty === "medium"
								? Colors.Yellow
								: Colors.Red
						)

					return message.edit({
						embeds: [embed],
						components: [],
					})
				} else {
					const correctParticipants = participants
						.filter(
							(participant) =>
								participant.answer === correctAnswer
						)
						.sort((a, b) => a.time - b.time)
					const winner = correctParticipants[0]

					const correctAnswerString = `\`•\` **Correct Answer:** ${correctAnswer}\n`
					const correctParticipantsString =
						correctParticipants.length > 0
							? `\`•\` **Correct Participants:**\n${correctParticipants
									.map((participant, index) => {
										return `\`${index + 1}.\` <@${
											participant.user
										}>`
									})
									.join("\n")}\n`
							: `\`•\` **Correct Participants:**\n**NO PARTICIPANTS**\n`
					const winnerString = winner
						? `\n\n**Winner:** <@${winner.user}>`
						: ""

					const embed = new EmbedBuilder()
						.setTitle("Trivia Question")
						.setDescription(
							categoryString +
								difficultyString +
								timesupString +
								questionString +
								correctAnswerString +
								correctParticipantsString +
								winnerString
						)
						.setColor(
							difficulty === "easy"
								? Colors.Green
								: difficulty === "medium"
								? Colors.Yellow
								: Colors.Red
						)

					// Edit button so each buttons shows how many participants answered
					const row =
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							allAnswers.map((answer, index) => {
								const participantsCount = participants.filter(
									(participant) =>
										participant.answer === answer
								).length

								return new ButtonBuilder()
									.setCustomId(`trivia-answer-${index}`)
									.setLabel(
										`${index + 1} (${participantsCount})`
									)
									.setStyle(ButtonStyle.Primary)
									.setDisabled(true)
							})
						)

					return message.edit({
						embeds: [embed],
						components: [row],
					})
				}
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
				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				})
			}
		}
	},
}
