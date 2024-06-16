import {
	Client,
	Interaction,
	EmbedBuilder,
	Events,
	Collection,
	Colors,
} from "discord.js"
import { TEvent } from "../types"
import isDeveloper from "../utils/checkDeveloper"

export default <TEvent>{
	name: Events.InteractionCreate,
	async execute(client: Client, interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			// Check if the command exists
			const command = interaction.client.commands.get(
				interaction.commandName
			)
			if (!command) return

			// Check if the command is guild only
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

			// Check if the command is developer only
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

			// Initialize commandCooldowns if not already initialized globally
			if (!client.commandCooldowns) {
				client.commandCooldowns = new Collection()
			}

			// Your existing cooldown logic
			if (command.cooldown) {
				const commandName = interaction.commandName
				const cooldowns = client.commandCooldowns
				const now = Date.now()
				const timestamps =
					cooldowns.get(commandName) ||
					new Collection<string, number>()

				if (timestamps.has(interaction.user.id)) {
					const expirationTime =
						timestamps.get(interaction.user.id)! + command.cooldown

					if (now < expirationTime) {
						const timeLeft = (expirationTime - now) / 1000
						const embed = new EmbedBuilder()
							.setColor(Colors.Red)
							.setDescription(
								`Please wait \`${timeLeft.toFixed(
									0
								)}\` more second(s) before reusing the \`${commandName}\` command.`
							)

						return await interaction.reply({
							embeds: [embed],
							ephemeral: true,
						})
					}
				}

				timestamps.set(interaction.user.id, now)
				cooldowns.set(commandName, timestamps)
				setTimeout(
					() => timestamps.delete(interaction.user.id),
					command.cooldown
				)
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

			if (!button) return

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
				return await command.autocomplete!(interaction, client)
			} catch (error) {
				console.error(error)
			}
		}
	},
}
