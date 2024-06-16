import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"

export default async function handleGuildOnly(
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
