import { Client, Interaction, Events } from "discord.js"
import { TEvent } from "../types"

// interaction handlers
import handleChatInputCommand from "../handlers/interactions/chatInputCommand"
import handleButtonInteraction from "../handlers/interactions/button"
import handleAutocompleteInteraction from "../handlers/interactions/autoComplete"

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
