import { AutocompleteInteraction, Client } from "discord.js"

export default async function handleAutocompleteInteraction(
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
