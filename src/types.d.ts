/**
 * @file src/types.d.ts
 * @module types
 * @description Type definitions for the Discord.js client, events, and commands.
 * @license MIT
 * @version 1.0.0
 */

import {
	AutocompleteInteraction,
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
	User,
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
		interaction: AutocompleteInteraction,
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

export type ITrivia = {
	userId: string
	totalCorrect: number
	totalEasy: number
	totalMedium: number
	totalHard: number
	points: number
}

/*
{
  result: 'reject',
  player: User {
    id: '1169294300597727387',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 4194368 },
    username: 'aymvn',
    globalName: 'Ayman',
    discriminator: '0',
    avatar: 'a22a4b2482161f4533f47b4f90c58267',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  opponent: User {
    id: '1228391260302348291',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'itzaymvn',
    globalName: 'Aymvn',
    discriminator: '0',
    avatar: 'b694ec888e0084a487ddef248854e42c',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  }
}
{
  result: 'win',
  player: User {
    id: '1169294300597727387',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 4194368 },
    username: 'aymvn',
    globalName: 'Ayman',
    discriminator: '0',
    avatar: 'a22a4b2482161f4533f47b4f90c58267',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  opponent: User {
    id: '1228391260302348291',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'itzaymvn',
    globalName: 'Aymvn',
    discriminator: '0',
    avatar: 'b694ec888e0084a487ddef248854e42c',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  gameBoard: [
    2, 1, 0, 2, 1,
    1, 2, 0, 0
  ],
  winner: '1228391260302348291'
}
{
  result: 'time',
  player: User {
    id: '1169294300597727387',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 4194368 },
    username: 'aymvn',
    globalName: 'Ayman',
    discriminator: '0',
    avatar: 'a22a4b2482161f4533f47b4f90c58267',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  opponent: User {
    id: '1228391260302348291',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'itzaymvn',
    globalName: 'Aymvn',
    discriminator: '0',
    avatar: 'b694ec888e0084a487ddef248854e42c',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  }
}
  {
  result: 'tie',
  player: User {
    id: '1169294300597727387',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 4194368 },
    username: 'aymvn',
    globalName: 'Ayman',
    discriminator: '0',
    avatar: 'a22a4b2482161f4533f47b4f90c58267',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  opponent: User {
    id: '1228391260302348291',
    bot: false,
    system: false,
    flags: UserFlagsBitField { bitfield: 0 },
    username: 'itzaymvn',
    globalName: 'Aymvn',
    discriminator: '0',
    avatar: 'b694ec888e0084a487ddef248854e42c',
    banner: null,
    accentColor: null,
    avatarDecoration: null
  },
  gameBoard: [
    1, 2, 1, 1, 1,
    2, 2, 1, 2
  ]
}
*/

type WinTicTacToeResult = {
	result: "win"
	player: User
	opponent: User
	gameBoard: number[]
	winner: string
}

type RejectTicTacToeResult = {
	result: "reject"
	player: User
	opponent: User
}

type TimeTicTacToeResult = {
	result: "time"
	player: User
	opponent: User
}

type TieTicTacToeResult = {
	result: "tie"
	player: User
	opponent: User
	gameBoard: number[]
}

export type TicTacToeResult =
	| WinTicTacToeResult
	| RejectTicTacToeResult
	| TimeTicTacToeResult
	| TieTicTacToeResult
