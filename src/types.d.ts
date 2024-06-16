/**
 * @file src/types.d.ts
 * @module types
 * @description Type definitions for the Discord.js client, events, and commands.
 * @license MIT
 * @version 1.0.0
 */

import {
	ButtonBuilder,
	ButtonInteraction,
	Client,
	Collection,
	CommandInteraction,
	Interaction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js"
import { Document } from "mongoose"

// Export the types for the Discord.js client to include commands
declare module "discord.js" {
	export interface Client {
		commands: Collection<string, TCommand>
		buttons: Collection<string, TButton>
		commandCooldowns: Collection<string, Collection<string, number>>
	}
}

// Export the types for the Discord.js client events
export type TEvent = {
	name: Events
	once?: boolean
	execute(client: Client, ...args: any[]): void
}

export type TButton = {
	name: string
	validate: (interaction: ButtonInteraction) => boolean
	execute(interaction: ButtonInteraction, client: Client): Promise<any>
}

// Export the types for the Discord.js command
export type TCommand = {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| SlashCommandOptionsOnlyBuilder
	devsOnly?: boolean
	guildOnly?: boolean
	userRequiredPermissions?: bigint[]
	cooldown?: number
	autocomplete?(
		interaction: CommandInteractionOptionResolver,
		client: Client
	): Promise<void>
	execute(interaction: CommandInteraction, client: Client): Promise<any>
}

type ParseDurationSuccess = {
	success: true
	duration: number
}

type ParseDurationFail = {
	success: false
	duration: 0
}

export type ParseDurationResult = ParseDurationSuccess | ParseDurationFail

export interface IReminder extends Document {
	userId: string
	message: string
	timestamp: number
	sent: boolean
}

export type TTask = {
	name: string
	interval: number | null
	execute(client: Client): Promise<void>
}
