/**
 * Tic Tac Toe command
 * @module commands/fun/tictactoe
 * @description Compete against another player in Tic Tac Toe
 * @license MIT
 * @version 1.0.0
 */

import {
	CommandInteractionOptionResolver,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"
const { TicTacToe } = require("discord-gamecord")

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("tictactoe")
		.setDescription("Compete against another player in Tic Tac Toe")
		.addUserOption((option) =>
			option
				.setName("opponent")
				.setDescription("The user you want to play against")
				.setRequired(true)
		),

	guildOnly: true,
	async execute(interaction) {
		const opponent = (
			interaction.options as CommandInteractionOptionResolver
		).getUser("opponent")

		if (!opponent) {
			return interaction.reply({
				content: "Please mention a user to play against.",
				ephemeral: true,
			})
		}

		if (opponent.id === interaction.user.id) {
			return interaction.reply({
				content: "You can't play against yourself.",
				ephemeral: true,
			})
		}

		const opponentGuild = interaction.guild!.members.cache.get(opponent.id)
		if (!opponentGuild) {
			return interaction.reply({
				content: "The opponent must be in the same server as you.",
				ephemeral: true,
			})
		}

		const Game = new TicTacToe({
			message: interaction,
			isSlashGame: false,
			opponent: opponent,
			embed: {
				title: "Tic Tac Toe",
				color: "#5865F2",
				statusTitle: "Status",
				overTitle: "Game Over",
			},
			emojis: {
				xButton: "❌",
				oButton: "🔵",
				blankButton: "➖",
			},
			mentionUser: true,
			timeoutTime: 60000,
			xButtonStyle: "DANGER",
			oButtonStyle: "PRIMARY",
			turnMessage: "{emoji} | Its turn of player **{player}**.",
			winMessage: "{emoji} | **{player}** won the TicTacToe Game.",
			tieMessage: "The Game tied! No one won the Game!",
			timeoutMessage: "The Game went unfinished! No one won the Game!",
			playerOnlyMessage:
				"Only {player} and {opponent} can use these buttons.",
		})

		Game.startGame()
		return
	},
}
