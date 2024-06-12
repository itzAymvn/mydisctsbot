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
import Reminder from "../../database/models/Reminder"
import cache from "../../utils/cacheManager"

const parseString = (time: string): number => {
	// Normalize input by converting to lowercase and trimming whitespace
	time = time.toLowerCase().trim()

	// Day can be: "d", "day", "days"
	// Hour can be: "h", "hr", "hrs", "hour", "hours"
	// Minute can be: "m", "min", "mins", "minute", "minutes"
	// Second can be: "s", "sec", "secs", "second", "seconds"
	const timeRegex =
		/(\d+)\s*(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)/g
	const matches = [...time.matchAll(timeRegex)]

	if (matches.length === 0) {
		throw new Error("Invalid time format")
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
						.setName("time")
						.setDescription(
							'The time to set the reminder for, e.g. "1h5m" for 1 hour and 5 minutes'
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
			const time = options.getString("time")
			if (!time) {
				return interaction.reply({
					content: "Please provide a time for the reminder",
					ephemeral: true,
				})
			}

			try {
				const duration = parseString(time)
				const message = options.getString("message") || "Reminder"

				const timestamp = Date.now() + duration * 1000
				const data = {
					userId: interaction.user.id,
					message,
					timestamp,
					sent: false,
				}
				const reminder = new Reminder(data)

				// Save the reminder to the database & cache
				await reminder.save()
				const reminders = (await cache.get("reminders")) || []
				reminders.push(reminder)
				await cache.set("reminders", reminders)

				// Send a Embed message to the user including the reminder details and a warning to let user know that they need to have DMs enabled
				const embed = new EmbedBuilder()
					.setTitle("Reminder Set")
					.setDescription(
						`I will remind you in ${time} with the message: ${message}\n` +
							`Please make sure you have DMs enabled to receive the reminder`
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
				return interaction.reply({
					content: error.message,
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

			const allReminders = (await cache.get("reminders")) || []
			const newReminders = allReminders.filter(
				(reminder: IReminder) =>
					!(reminder.userId === userId && reminder.sent === sent)
			)

			await cache.set("reminders", newReminders)

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
