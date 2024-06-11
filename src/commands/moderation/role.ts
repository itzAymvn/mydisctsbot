/**
 * Role Command
 * @module commands/moderation/role
 * @description Give or remove roles from a user in the server
 * @license MIT
 * @version 1.0.0
 */

import {
	CommandInteractionOptionResolver,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("roles")
		.setDescription("Give or remove roles from a user in the server.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Add a role to a user.")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("The user to add the role to.")
						.setRequired(true)
				)
				.addRoleOption((option) =>
					option
						.setName("role")
						.setDescription("The role to add to the user.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("remove")
				.setDescription("Remove a role from a user.")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("The user to remove the role from.")
						.setRequired(true)
				)
				.addRoleOption((option) =>
					option
						.setName("role")
						.setDescription("The role to remove from the user.")
						.setRequired(true)
				)
		),

	guildOnly: true,
	userRequiredPermissions: [PermissionFlagsBits.ManageRoles],

	async execute(interaction, client) {
		/**
        If you have a command that contains subcommands, the CommandInteractionOptionResolver#getSubcommand() will tell you which subcommand was used. You can then get any additional options of the selected subcommand using the same methods as above.
        */

		const generateErrorEmbed = (message: string): EmbedBuilder => {
			return new EmbedBuilder()
				.setTitle("Error")
				.setDescription(message)
				.setColor("Red")
		}

		const options = interaction.options as CommandInteractionOptionResolver
		const subcommand = options.getSubcommand()
		const botMember = interaction.guild!.members.cache.get(client.user!.id)
		const interactionMember = interaction.guild!.members.cache.get(
			interaction.user.id
		)

		if (subcommand === "add") {
			const userOption = options.getUser("user")
			const roleOption = options.getRole("role")

			if (!userOption || !roleOption) {
				return interaction.reply({
					content: "Please provide a user and a role.",
					ephemeral: true,
				})
			}

			const user = interaction.guild!.members.cache.get(userOption.id)
			const role = interaction.guild!.roles.cache.get(roleOption.id)

			if (!user || !role) {
				return interaction.reply({
					content: "User or role not found.",
					ephemeral: true,
				})
			}

			// prevent the bot from giving itself roles
			if (user.id === client.user!.id) {
				const errorEmbed = generateErrorEmbed(
					`I can't give myself roles.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}

			// if the user has higher role than the bot, return
			if (
				user.roles.highest.comparePositionTo(
					botMember!.roles.highest
				) >= 0
			) {
				const errorEmbed = generateErrorEmbed(
					`The user ${user.user.tag} has a higher role than me.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}

			// if the role is higher than the bot, return
			if (role.comparePositionTo(botMember!.roles.highest) >= 0) {
				const errorEmbed = generateErrorEmbed(
					`I can't give the role \`${role.name}\` because it is higher than me.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}

			// if the role is higher than the role of whoever ran the command, return (this is to prevent users from giving roles higher than their own)
			if (role.comparePositionTo(interactionMember!.roles.highest) >= 0) {
				const errorEmbed = generateErrorEmbed(
					`You can't give the role \`${role.name}\` because it is higher than your highest role.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}

			// if the user already has the role, return
			if (user.roles.cache.has(role.id)) {
				const errorEmbed = generateErrorEmbed(
					`The user ${user.user.tag} already has the role \`${role.name}\`.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}

			try {
				await user.roles.add(role)
				return interaction.reply({
					content: `Role \`${role.name}\` added to ${user.user.tag}.`,
				})
			} catch (error) {
				console.error(error)
				const errorEmbed = generateErrorEmbed(
					`An error occurred while adding the role \`${role.name}\` to ${user.user.tag}.`
				)
				return interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				})
			}
		} else
			return interaction.reply({
				content: "This command is not yet implemented.",
				ephemeral: true,
			})
	},
}
