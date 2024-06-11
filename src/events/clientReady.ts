/**
 * This event is fired when the client is ready to start working.
 * @param {Client} client - The client.
 * @event clientReady
 * @license MIT
 */

import { ActivityType, Client, Events } from "discord.js"
import { TEvent } from "../types"

export default <TEvent>{
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		// Check if the client user is undefined
		if (!client.user) return console.error("Client user is undefined")

		// Set the client activity to the total number of servers the client is in
		const totalServers = client.guilds.cache.size || 0
		client.user.setActivity(`${totalServers} servers`, {
			type: ActivityType.Watching,
		})

		// Report that the client is ready
		console.log(`[READY] Logged in as ${client.user.tag}!`)
	},
}
