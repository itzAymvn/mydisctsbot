/**
 * Bug Report Command
 * @module commands/utility/bugreport
 * @description Report a bug to the bot developers.
 * @license MIT
 * @version 1.0.0
 */

import {
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	cooldown: 3600000, // 1 hour

	data: new SlashCommandBuilder()
		.setName("bugreport")
		.setDescription("Report a bug to the bot developers.")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The command you encountered the bug on.")
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("A description of the bug.")
				.setMaxLength(2000)
				.setMinLength(10)
				.setRequired(true)
		),

	async autocomplete(interaction, client) {
		const commands = client.commands
			.map((command) => command.data.name)
			.sort()
		const focused = interaction.options.getFocused().toLowerCase()
		if (!focused) {
			return interaction.respond(
				commands
					.map((command) => ({
						name: command,
						value: command,
					}))
					.slice(0, commands.length > 25 ? 25 : commands.length)
			)
		}

		const filtered = commands
			.filter((command) => command.toLowerCase().includes(focused))
			.slice(0, 25)

		const options =
			filtered.map((command) => ({
				name: command,
				value: command,
			})) || []

		return interaction.respond(options)
	},

	async execute(interaction, client) {
		if (!process.env?.DISCORD_GUILD_BUGS_CHANNEL_ID) {
			return interaction.reply({
				content:
					"The bot developer has not set up a bug report channel.",
				ephemeral: true,
			})
		}

		const options = interaction.options as CommandInteractionOptionResolver
		const command = options.getString("command")!
		const description = options.getString("description")!

		const channel = await client.channels.fetch(
			process.env.DISCORD_GUILD_BUGS_CHANNEL_ID,
			{ force: true }
		)

		if (!channel) {
			return interaction.reply({
				content:
					"The bot developer has not set up a bug report channel.",
				ephemeral: true,
			})
		}

		const embed = new EmbedBuilder()
			.setTitle("Bug Report")
			.setDescription(
				`**Command:** ${command}\n` +
					`**Description:** ${description}` +
					`\n\n` +
					`**User:** ${interaction.user}\n` +
					(interaction.guild
						? `**Guild:** \`${interaction.guild.name} (${interaction.guild.id})\`\n`
						: "") +
					(interaction.channel
						? `**Channel:** ${interaction.channel}\n`
						: "") +
					`**Reported At:** <t:${Math.floor(
						interaction.createdTimestamp / 1000
					)}:R>`
			)
			.setFooter({
				text: `Reported by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setColor(Colors.Red)
			.setTimestamp()

		try {
			await (channel as TextChannel).send({ embeds: [embed] })

			return interaction.reply({
				content: "Your bug report has been submitted.",
				ephemeral: true,
			})
		} catch (error) {
			console.error(error)
			return interaction.reply({
				content: "An error occurred while submitting your bug report.",
				ephemeral: true,
			})
		}
	},
}
