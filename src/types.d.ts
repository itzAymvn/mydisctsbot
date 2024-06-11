/**
 * @file src/types.d.ts
 * @module types
 * @description Type definitions for the Discord.js client, events, and commands.
 * @license MIT
 * @version 1.0.0
 */

import {
	Client,
	Collection,
	CommandInteraction,
	Interaction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js"

// Export the types for the Discord.js client to include commands
declare module "discord.js" {
	export interface Client {
		commands: Collection<string, TCommand>
	}
}

// Export the types for the Discord.js client events
export type TEvent = {
	name: Events
	once?: boolean
	execute(client: Client, ...args: any[]): void
}

// Export the types for the Discord.js command
export type TCommand = {
	data: SlashCommandBuilder
	devsOnly?: boolean
	guildOnly?: boolean
	userRequiredPermissions?: bigint[]
	execute(interaction: CommandInteraction, client: Client): Promise<any>
}
