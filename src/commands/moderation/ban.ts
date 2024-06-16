/**
 * Ban Command
 * @module commands/moderation/ban
 * @description Ban a user from the server
 * @license MIT
 * @version 1.0.0
 */

import {
	Colors,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js"
import { TCommand } from "../../types"

export default <TCommand>{
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Ban a user from the server.")
		.setDefaultMemberPermissions(0)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to ban.")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("The reason for banning the user.")
				.setRequired(false)
		),

	guildOnly: true,
	userRequiredPermissions: [PermissionFlagsBits.ManageRoles],

	async execute(interaction, client) {
		const options = interaction.options as CommandInteractionOptionResolver
		const user = options.getUser("user")
		const reason = options.getString("reason") || "No reason provided."

		const member = interaction.guild!.members.cache.get(user!.id)
		if (!member) {
			return interaction.reply("User is not a member of this server.")
		}

		if (!member.bannable) {
			return interaction.reply({
				content: "I cannot ban this user.",
				ephemeral: true,
			})
		}

		try {
			await member.ban({ reason })
			const embed = new EmbedBuilder()
				.setTitle("User Banned")
				.setDescription(
					`\`•\` **User:** \`${user!.tag}\`\n` +
						`\`•\` **Reason:** \`${reason}\``
				)
				.setColor(Colors.Red)
				.setTimestamp()
				.setFooter({
					text: `Banned by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL(),
				})

			return await interaction.reply({ embeds: [embed] })
		} catch (error) {
			console.error(error)
			return await interaction.reply(
				"There was an error while trying to ban the user."
			)
		}
	},
}
