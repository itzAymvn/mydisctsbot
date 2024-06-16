import { ButtonInteraction, Client } from "discord.js"

export default async function handleButtonInteraction(
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
