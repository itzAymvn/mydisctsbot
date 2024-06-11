/**
 * This event is triggered whenever the interactionCreate event is fired.
 * @param {Client} client - The client.
 * @param {Interaction} interaction - The interaction.
 * @event interactionCreate
 * @license MIT
 */

import { Client, EmbedBuilder, Events, Interaction } from "discord.js"
import { TEvent } from "../types"

export default <TEvent>{
	name: Events.InteractionCreate,
	async execute(client: Client, interaction: Interaction) {
		// Check if the interaction is not a command
		if (!interaction.isChatInputCommand()) return
		if (!interaction.member) return

		const guildMember = interaction.guild?.members.cache.get(
			interaction.user.id
		)

		// Check if the command is not registered
		const command = interaction.client.commands.get(interaction.commandName)
		if (!command) {
			console.error(
				`No command matching ${interaction.commandName} was found.`
			)
			return
		}

		// Check if the command is guildOnly and the interaction is not in a guild
		if (command.guildOnly && !interaction.guild) {
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"This command can only be executed in a server."
				)
			return await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			})
		}

		// Check if the command has userRequiredPermissions and the user is missing them
		if (command.userRequiredPermissions) {
			if (!guildMember) return
			const missing = guildMember.permissions.missing(
				command.userRequiredPermissions
			)

			if (missing.length) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setDescription(
						`You are missing the following permissions: **${missing.join(
							", "
						)}**`
					)

				return await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				})
			}
		}

		// Try to execute the command
		try {
			return await command.execute(interaction, client)
		} catch (error) {
			console.error(error)
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: "There was an error while executing this command!",
					ephemeral: true,
				})
			} else {
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				})
			}
		}
	},
}
