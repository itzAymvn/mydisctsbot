/**
 * invite Command
 * @module commands/utility/invite
 * @description Invite the bot to your server!
 * @license MIT
 * @version 1.0.0
 */

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite the bot to your server!"),
	async execute(interaction) {
		const link = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_APP_ID}&permissions=8&scope=bot%20applications.commands`

		// Create a new embed
		const embed = new EmbedBuilder()
			.setTitle("Invite Me!")
			.setDescription(
				"You can invite me to your server by clicking the button below."
			)
			.setColor("Green")
			.setTimestamp()
			.setFooter({
				text: "Requested by " + interaction.user.tag,
				iconURL: interaction.user.avatarURL() || undefined,
			})

		// Create a new button
		const button = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel("Invite Me!")
			.setURL(link)
			.setEmoji("🤖")

		// Create a new action row
		const component = new ActionRowBuilder().addComponents(button) as any

		// Send the embed with the button
		await interaction.reply({
			embeds: [embed],
			components: [component],
		})
	},
}
