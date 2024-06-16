import {
	Client,
	Interaction,
	EmbedBuilder,
	Events,
	Collection,
	Colors,
	ChatInputCommandInteraction,
	ButtonInteraction,
	AutocompleteInteraction,
} from "discord.js"
import { TEvent } from "../types"
import isDeveloper from "../utils/checkDeveloper"

// Command handlers
async function handleGuildOnly(
	interaction: ChatInputCommandInteraction,
	command: any
) {
	if (command.guildOnly && !interaction.guild) {
		const embed = new EmbedBuilder()
			.setColor("Red")
			.setDescription("This command can only be executed in a server.")
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return false
	}
	return true
}
async function handleDevsOnly(
	interaction: ChatInputCommandInteraction,
	command: any
) {
	if (command.devsOnly && !isDeveloper(interaction.user.id)) {
		const embed = new EmbedBuilder()
			.setColor("Red")
			.setDescription("This command can only be executed by developers.")
		await interaction.reply({ embeds: [embed], ephemeral: true })
		return false
	}
	return true
}
async function handleUserPermissions(
	interaction: ChatInputCommandInteraction,
	command: any
) {
	if (command.userRequiredPermissions) {
		const guildMember = interaction.guild?.members.cache.get(
			interaction.user.id
		)!
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
			await interaction.reply({ embeds: [embed], ephemeral: true })
			return false
		}
	}
	return true
}
async function handleCooldown(
	client: Client,
	interaction: ChatInputCommandInteraction,
	command: any
) {
	if (!client.commandCooldowns) {
		client.commandCooldowns = new Collection()
	}

	if (command.cooldown) {
		const commandName = interaction.commandName
		const cooldowns = client.commandCooldowns
		const now = Date.now()
		const timestamps =
			cooldowns.get(commandName) || new Collection<string, number>()

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

				await interaction.reply({ embeds: [embed], ephemeral: true })
				return false
			}
		}

		timestamps.set(interaction.user.id, now)
		cooldowns.set(commandName, timestamps)
		setTimeout(
			() => timestamps.delete(interaction.user.id),
			command.cooldown
		)
	}
	return true
}

// Interactions handlers
async function handleChatInputCommand(
	client: Client,
	interaction: ChatInputCommandInteraction
) {
	const command = interaction.client.commands.get(interaction.commandName)
	if (!command) return

	if (!(await handleGuildOnly(interaction, command))) return
	if (!(await handleDevsOnly(interaction, command))) return
	if (!(await handleUserPermissions(interaction, command))) return
	if (!(await handleCooldown(client, interaction, command))) return

	try {
		await command.execute(interaction, client)
	} catch (error) {
		console.error(error)
		const replyContent = "There was an error while executing this command!"
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: replyContent,
				ephemeral: true,
			})
		} else {
			await interaction.reply({ content: replyContent, ephemeral: true })
		}
	}
}
async function handleButtonInteraction(
	client: Client,
	interaction: ButtonInteraction
) {
	const button = interaction.client.buttons.find((b) =>
		b.validate(interaction)
	)
	if (!button) return

	try {
		await button.execute(interaction, client)
	} catch (error) {
		console.error(error)
		await interaction.reply({
			content: "There was an error while executing this button!",
			ephemeral: true,
		})
	}
}
async function handleAutocompleteInteraction(
	client: Client,
	interaction: AutocompleteInteraction
) {
	const command = interaction.client.commands.get(interaction.commandName)
	if (!command) {
		console.error(
			`No command matching ${interaction.commandName} was found.`
		)
		return
	}

	try {
		await command.autocomplete!(interaction, client)
	} catch (error) {
		console.error(error)
	}
}

export default <TEvent>{
	name: Events.InteractionCreate,
	async execute(client: Client, interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			await handleChatInputCommand(client, interaction)
		} else if (interaction.isButton()) {
			await handleButtonInteraction(client, interaction)
		} else if (interaction.isAutocomplete()) {
			await handleAutocompleteInteraction(client, interaction)
		} else {
			console.log(`Unhandled interaction type: ${interaction.type}`)
		}
	},
}
