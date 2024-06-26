import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import isDeveloper from "../../utils/checkDeveloper"
import { TCommand } from "../../types"

export default async function handleDevsOnly(
	interaction: ChatInputCommandInteraction,
	command: TCommand
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
