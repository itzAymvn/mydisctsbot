/**
 * Ping command
 * @module commands/utility/ping
 * @description Replies with Pong!
 * @license MIT
 * @version 1.0.0
 */

import { SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with Pong!"),
	async execute(interaction) {
		await interaction.reply("Pong!")
	},
}
