/**
 * Timezone Command
 * @module commands/utility/timezone
 * @description Replies with the current time in the specified timezone
 * @license MIT
 * @version 1.0.0
 */

import {
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
import moment from "moment-timezone"

const timezones = moment.tz.names()

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("timezone")
		.setDescription(
			"Replies with the current time in the specified timezone"
		)
		.addStringOption((option) =>
			option
				.setName("timezone")
				.setDescription("The timezone to get the current time from")
				.setRequired(true)
				.setAutocomplete(true)
		),

	async autocomplete(interaction) {
		const focused = interaction.options.getFocused()

		if (!focused) {
			return await interaction.respond(
				timezones.slice(0, 25).map((timezone) => ({
					name: timezone,
					value: timezone,
				}))
			)
		}

		const filtered = timezones.filter((timezone) =>
			timezone.toLowerCase().includes(focused.toLowerCase())
		)

		const options = filtered
			.map((timezone) => ({
				name: timezone,
				value: timezone,
			}))
			.slice(0, 25)

		return await interaction.respond(options)
	},

	async execute(interaction) {
		const timezone = (
			interaction.options as CommandInteractionOptionResolver
		).getString("timezone", true)

		// Get current time in UTC
		const currentTimeUTC = new Date()

		// Create new embed
		const embed = new EmbedBuilder()

		try {
			// Validate the timezone
			if (moment.tz.zone(timezone) === null) {
				embed
					.setTitle("Error")
					.setDescription(
						`${timezone} is not a valid timezone. Please make sure to select a valid timezone.`
					)
					.setColor("#FF0000")
					.setTimestamp()
					.setFooter({
						text: `Requested by ${interaction.user.tag}`,
						iconURL: interaction.user.displayAvatarURL(),
					})

				return await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				})
			}

			// Get current time in the specified timezone
			const currentTime = moment(currentTimeUTC)
				.tz(timezone)
				.format("dddd, MMMM Do YYYY, h:mm:ss a")

			// Create a new embed
			embed
				.setTitle("Timezone Converter")
				.setDescription(
					`\`•\` Timezone: **${timezone}**\n` +
						`\`•\` Current Time: **${currentTime}**`
				)
				.setColor("#5865F2")
				.setTimestamp()
				.setFooter({
					text: `Requested by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL(),
				})

			// Reply with the embed
			return await interaction.reply({
				embeds: [embed],
			})
		} catch (error) {
			// Handle any errors
			embed
				.setTitle("Error")
				.setDescription(
					"An error occurred while trying to get the current time in the specified timezone."
				)
				.setColor("#FF0000")
				.setTimestamp()
				.setFooter({
					text: `Requested by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL(),
				})

			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		}
	},
}
