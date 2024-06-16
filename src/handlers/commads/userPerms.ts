import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { TCommand } from "../../types"

export default async function handleUserPermissions(
	interaction: ChatInputCommandInteraction,
	command: TCommand
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
