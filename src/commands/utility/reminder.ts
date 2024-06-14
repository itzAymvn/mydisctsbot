/**
 * Reminder command
 * @module commands/utility/reminder
 * @description Set a reminder for a specific time
 * @license MIT
 * @version 1.0.0
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
import moment from "moment-timezone"
import Reminder from "../../database/models/Reminder"

const parseString = (time: string): number => {
	time = time.toLowerCase().trim()

	const timeRegex =
		/(\d+)\s*(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)/g
	const matches = [...time.matchAll(timeRegex)]

	if (matches.length === 0) {
		throw new Error("Invalid time format. Use ?d ?h ?m ?s")
	}

	let duration = 0
	for (const match of matches) {
		const [_, value, unit] = match
		if (!value || !unit) {
			throw new Error("Invalid time format")
		}
		const numValue = parseInt(value)
		switch (unit) {
			case "d":
			case "day":
			case "days":
				duration += numValue * 86400 // 1 day = 86400 seconds
				break
			case "h":
			case "hr":
			case "hrs":
			case "hour":
			case "hours":
				duration += numValue * 3600 // 1 hour = 3600 seconds
				break
			case "m":
			case "min":
			case "mins":
			case "minute":
			case "minutes":
				duration += numValue * 60 // 1 minute = 60 seconds
				break
			case "s":
			case "sec":
			case "secs":
			case "second":
			case "seconds":
				duration += numValue // 1 second = 1 second
				break
			default:
				throw new Error("Invalid time unit")
		}
	}

	return duration // in seconds
}

const parseDate = (dateString: string): number => {
	const date = moment.tz(dateString, "MM/DD/YYYY HH:mm:ss", moment.tz.guess())

	if (!date.isValid()) {
		throw new Error("Invalid date format. Use MM/DD/YYYY HH:MM:SS")
	}

	if (date.isBefore(Date.now())) {
		throw new Error(`${date.format("lll")} is in the past`)
	}

	return date.valueOf()
}

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("reminder")
		.setDescription("Useful reminder commands")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("set")
				.setDescription("Set a reminder")
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription(
							"The type date you want to set the reminder for"
						)
						.setRequired(true)
						.addChoices([
							// e.g. 1h 30s
							{
								name: "Duration",
								value: "duration",
							},

							// e.g. 06/12/2024 18:00:00
							{
								name: "Date",
								value: "date",
							},

							// e.g. 1672531200
							{
								name: "Epoch Timestamp",
								value: "epoch",
							},
						])
				)
				.addStringOption((option) =>
					option
						.setName("time")
						.setDescription(
							'Duration: "?d ?h ?m ?s | Date (in UTC): "MM/DD/YYYY HH:MM:SS" | Epoch Timestamp: "1672531200"'
						)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("message")
						.setDescription(
							"The message to send when the reminder is up"
						)
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("list").setDescription("List all your reminders")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("clear")
				.setDescription("Clear all your reminders")
				.addBooleanOption((option) =>
					option
						.setName("sent")
						.setDescription(
							"Only clear reminders that have been sent already"
						)
						.setRequired(false)
				)
		),
	async execute(interaction) {
		const options = interaction.options as CommandInteractionOptionResolver
		const subcommand = options.getSubcommand()

		if (subcommand === "set") {
			const type = options.getString("type")
			const time = options.getString("time")
			const message = options.getString("message") || "Reminder"

			if (!time) {
				return interaction.reply({
					content: "Please provide a time for the reminder",
					ephemeral: true,
				})
			}

			try {
				let timestamp: number = 0
				if (type === "duration") {
					const duration = parseString(time)
					timestamp = Date.now() + duration * 1000
				} else if (type === "date") {
					timestamp = parseDate(time)
				} else if (type === "epoch") {
					const epoch = parseInt(time)
					const date = new Date(epoch * 1000)
					if (isNaN(date.getTime())) {
						throw new Error("Invalid epoch timestamp")
					}

					if (date.getTime() < Date.now()) {
						throw new Error("Date must be in the future")
					}

					timestamp = epoch * 1000
				} else {
					return interaction.reply({
						content: "Invalid type",
						ephemeral: true,
					})
				}

				const data = {
					userId: interaction.user.id,
					message,
					timestamp,
					sent: false,
				}
				const reminder = new Reminder(data)

				// Save the reminder to the database
				await reminder.save()

				// Send an Embed message to the user including the reminder details and a warning to let user know that they need to have DMs enabled
				const embed = new EmbedBuilder()
					.setTitle("Reminder Set")
					.setDescription(
						`\`•\` **Message:** ${message}\n` +
							`\`•\` **Time:** <t:${Math.floor(
								timestamp / 1000
							)}:R>\n` +
							"\n" +
							"Please make sure you have DMs enabled to receive the reminder"
					)
					.setColor("Green")
					.setTimestamp(timestamp)
					.setFooter({
						text: "Reminder",
						iconURL: interaction.user.displayAvatarURL(),
					})

				// Add Cancel Reminder button to the embed message
				const cancelReminder = new ButtonBuilder()
					.setCustomId(`cancelReminder-ID:${reminder._id}`)
					.setLabel("Cancel Reminder")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("🗑️")

				// Create row
				const row = new ActionRowBuilder().addComponents(
					cancelReminder
				) as any

				return await interaction.reply({
					embeds: [embed],
					components: [row],
				})
			} catch (error: any) {
				const errorEmbed = new EmbedBuilder()
					.setTitle("Error")
					.setDescription(error.message)
					.setColor("Red")
					.setFooter({
						text: "Reminder",
						iconURL: interaction.user.displayAvatarURL(),
					})

				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}
		} else if (subcommand === "list") {
			const userId = interaction.user.id

			// Page size and current page initialization
			let currentPage = 1
			const pageSize = 5

			// Count total reminders to determine total pages
			const totalRemindersCount = await Reminder.countDocuments({
				userId,
			})

			// Calculate total pages
			const totalPages = Math.ceil(totalRemindersCount / pageSize)

			// Function to generate embed for the current page
			const generateEmbed = async (page: number) => {
				// Fetch reminders for the current page
				const reminders = await Reminder.find({
					userId,
				})
					.sort({ timestamp: -1 })
					.skip((page - 1) * pageSize)
					.limit(pageSize)

				// If no reminders are found
				if (reminders.length === 0) {
					return {
						success: false,
						error: "There are no reminders to display",
					}
				}

				// Create the embed message
				const embed = new EmbedBuilder()
					.setTitle("Reminders")
					.setColor(Colors.Blue)
					.setDescription(
						reminders
							.map((reminder, index) => {
								return `${reminder.sent ? "✔" : "✖"} | ${
									reminder.message
								} - <t:${Math.floor(
									reminder.timestamp / 1000
								)}:R>`
							})
							.join("\n")
					)
					.setFooter({
						text: `Page ${page}/${totalPages.toLocaleString()} | Total Reminders: ${totalRemindersCount.toLocaleString()}`,
						iconURL: interaction.user.displayAvatarURL(),
					})

				return {
					success: true,
					embed: embed,
				}
			}

			// Send the initial embed
			const initialEmbed = await generateEmbed(currentPage)
			if (!initialEmbed.success) {
				return interaction.reply({
					content: initialEmbed.error,
					ephemeral: true,
				})
			}

			// Add Buttons to the initial embed
			const previousButton = new ButtonBuilder()
				.setCustomId(`previousReminderPage`)
				.setLabel("Previous")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(currentPage === 1)
				.setEmoji("⬅️")

			const nextButton = new ButtonBuilder()
				.setCustomId(`nextReminderPage`)
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

			// Handle the collector
			collector.on("collect", async (buttonInteraction) => {
				// Check if the button was clicked by the user
				if (buttonInteraction.user.id !== interaction.user.id) {
					return buttonInteraction.reply({
						content: "This button is not for you",
						ephemeral: true,
					})
				}

				// Handle the button ID
				switch (buttonInteraction.customId) {
					case "previousReminderPage":
						currentPage--
						break
					case "nextReminderPage":
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

			// Handle the collector end event
			collector.on("end", async () => {
				row.components[0].setDisabled(true)
				row.components[1].setDisabled(true)

				return await initMessage.edit({
					components: [row],
				})
			})

			return
		} else if (subcommand === "clear") {
			const sent = options.getBoolean("sent")
			const userId = interaction.user.id

			const reminders = await Reminder.find({
				userId,
				sent: sent || false,
			})

			if (reminders.length === 0) {
				return interaction.reply({
					content: "You have no reminders to clear",
					ephemeral: true,
				})
			}

			await Reminder.deleteMany({
				userId,
				sent: sent || false,
			})

			return interaction.reply({
				content: `Cleared ${reminders.length} reminders`,
			})
		} else {
			return interaction.reply({
				content: "Invalid subcommand",
				ephemeral: true,
			})
		}
	},
}
