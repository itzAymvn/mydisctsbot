import { ChatInputCommandInteraction, Client } from "discord.js"

// Command Handlers
import handleGuildOnly from "../commads/guildOnly"
import handleDevsOnly from "../commads/devsOnly"
import handleUserPermissions from "../commads/userPerms"
import handleCooldown from "../commads/cooldown"

export default async function handleChatInputCommand(
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