import { Client, Interaction, EmbedBuilder, Events } from "discord.js"
import { TEvent } from "../types"
import isDeveloper from "../utils/checkDeveloper"

export default <TEvent>{
	name: Events.InteractionCreate,
	async execute(client: Client, interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(
				interaction.commandName
			)

			if (!command) {
				console.error(
					`No command matching ${interaction.commandName} was found.`
				)
				return
			}

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

			if (command.devsOnly && !isDeveloper(interaction.user.id)) {
				const embed = new EmbedBuilder()
					.setColor("Red")
					.setDescription(
						"This command can only be executed by developers."
					)
				return await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				})
			}

			const guildMember = interaction.guild?.members.cache.get(
				interaction.user.id
			)!

			if (command.userRequiredPermissions) {
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

			try {
				return await command.execute(interaction, client)
			} catch (error) {
				console.error(error)
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content:
							"There was an error while executing this command!",
						ephemeral: true,
					})
				} else {
					await interaction.reply({
						content:
							"There was an error while executing this command!",
						ephemeral: true,
					})
				}
			}
		}

		if (interaction.isButton()) {
			const button = interaction.client.buttons.find((b) =>
				b.validate(interaction)
			)

			if (!button) {
				return console.error(
					`No button matching ${interaction.customId} was found.`
				)
			}

			try {
				return await button.execute(interaction, client)
			} catch (error) {
				console.error(error)
				await interaction.reply({
					content: "There was an error while executing this button!",
					ephemeral: true,
				})
			}
		}

		if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(
				interaction.commandName
			)

			if (!command) {
				console.error(
					`No command matching ${interaction.commandName} was found.`
				)
				return
			}

			try {
				return await command.autocomplete!(interaction)
			} catch (error) {
				console.error(error)
			}
		}
	},
}
