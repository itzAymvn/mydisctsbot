/**
 * This event is fired when the bot leaves a guild.
 * @param {Client} client - The client.
 * @param {Guild} guild - The guild the bot left.
 * @event guildDelete
 * @license MIT
 */

import { ActivityType, Events, Client, Guild } from "discord.js"
import { TEvent } from "../types"

export default <TEvent>{
	name: Events.GuildDelete,
	async execute(client: Client, guild: Guild) {
		if (!client.user) return

		// Total number of guilds the bot is in
		const totalGuilds = client.guilds.cache.size

		// Set the bot's activity to the total number of guilds
		client.user.setActivity({
			type: ActivityType.Watching,
			name: `${totalGuilds} servers`,
		})
	},
}
