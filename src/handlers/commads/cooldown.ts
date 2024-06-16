import { ChatInputCommandInteraction, Client, Collection, Colors, EmbedBuilder } from "discord.js"

export default async function handleCooldown(
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
