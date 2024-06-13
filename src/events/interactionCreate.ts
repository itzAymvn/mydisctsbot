import { Client, Interaction, EmbedBuilder, Events } from "discord.js"
import { TEvent } from "../types"
import isDeveloper from "../utils/checkDeveloper"
import Reminder from "../database/models/Reminder"

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
			if (interaction.customId.startsWith("cancelReminder-ID:")) {
				const reminderId = interaction.customId.split("ID:")[1]
				const reminder = await Reminder.findOne({ _id: reminderId })

				if (!reminder) {
					return interaction.reply({
						content: "This reminder doesn't exist.",
						ephemeral: true,
					})
				}

				if (reminder.userId !== interaction.user.id) {
					return interaction.reply({
						content: "You can only cancel your own reminders.",
						ephemeral: true,
					})
				}

				if (reminder.sent) {
					return interaction.reply({
						content:
							"You can't cancel a reminder that has already been sent.",
						ephemeral: true,
					})
				}

				try {
					await reminder.deleteOne()
					return interaction.reply({
						content: "Reminder has been cancelled.",
						ephemeral: true,
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

			const button = interaction.client.buttons.get(interaction.customId)

			if (!button) {
				console.error(
					`No button matching ${interaction.customId} was found.`
				)
				return
			}

			try {
				return await button.execute(interaction, client)
			} catch (error) {
				console.error(error)
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content:
							"There was an error while executing this button!",
						ephemeral: true,
					})
				} else {
					await interaction.reply({
						content:
							"There was an error while executing this button!",
						ephemeral: true,
					})
				}
			}
		}
	},
}
