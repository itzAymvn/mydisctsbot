/**
 * Reminder command
 * @module commands/utility/reminder
 * @description Set a reminder for a specific time
 * @license MIT
 * @version 1.0.0
 */

import {
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { IReminder, TCommand } from "../../types"
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
			subcommand
				.setName("list")
				.setDescription("List all your reminders")
				.addBooleanOption((option) =>
					option
						.setName("sent")
						.setDescription(
							"Only show reminder that have been sent already"
						)
						.setRequired(false)
				)
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
		const channel = interaction.channel
		if (!channel) {
			return interaction.reply({
				content: "This command can only be used in a server",
				ephemeral: true,
			})
		}

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

				return await interaction.reply({
					embeds: [embed],
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
		}

		if (subcommand === "list") {
			const sent = options.getBoolean("sent")
			const userId = interaction.user.id

			const reminders = await Reminder.find({
				userId,
				sent: sent || false,
			})

			if (reminders.length === 0) {
				return interaction.reply({
					content:
						"You have no reminders. Set one using `/reminder set`",
					ephemeral: true,
				})
			}

			const embed = new EmbedBuilder()
				.setTitle("Your Reminders")
				.setColor("Blue")
				.setTimestamp()
				.setDescription(
					reminders
						.map(
							(reminder: IReminder, index: number) =>
								`**${index + 1}.** ${
									reminder.message
								} - <t:${Math.floor(
									reminder.timestamp / 1000
								)}:R>`
						)
						.join("\n")
				)
				.setFooter({
					text: "Reminder",
					iconURL: interaction.user.displayAvatarURL(),
				})

			return await interaction.reply({
				embeds: [embed],
			})
		}

		if (subcommand === "clear") {
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
		}

		return interaction.reply({
			content: "Invalid subcommand",
			ephemeral: true,
		})
	},
}
