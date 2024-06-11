/**
 * Clear cache command
 * @module commands/developer/clearCache
 * @description Clear the cache
 * @license MIT
 * @version 1.0.0
 */

import { SlashCommandBuilder } from "discord.js"
import { TCommand } from "../../types"
import cache from "../../utils/cacheManager"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("clearcache")
		.setDescription("Clear the cache"),

	devsOnly: true,
	async execute(interaction) {
		try {
			await cache.clear()
			return interaction.reply({
				content: "Cache has been cleared.",
				ephemeral: true,
			})
		} catch (error) {
			console.error(error)
			return interaction.reply({
				content: "An error occurred while clearing the cache.",
				ephemeral: true,
			})
		}
	},
}
