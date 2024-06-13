import { EmbedBuilder } from "discord.js"
import { TButton } from "../../types"
import Reminder from "../../database/models/Reminder"

export default <TButton>{
	name: "cancelReminder",

	validate: (interaction) => {
		return interaction.customId.startsWith("cancelReminder-ID:")
	},

	async execute(interaction, client) {
		const reminderId = interaction.customId.split("ID:")[1]
		const reminder = await Reminder.findOne({ _id: reminderId })

		if (!reminder) {
			return interaction.reply({
				content: "This reminder doesn't exist.",
				ephemeral: true,
			})
		}

		if (reminder.userId !== interaction.user.id) {
			return interaction.reply({
				content: "You can only cancel your own reminders.",
				ephemeral: true,
			})
		}

		if (reminder.sent) {
			return interaction.reply({
				content:
					"You can't cancel a reminder that has already been sent.",
				ephemeral: true,
			})
		}

		try {
			await reminder.deleteOne()
			return interaction.reply({
				content: "Reminder has been cancelled.",
				ephemeral: true,
			})
		} catch (error: any) {
			const errorEmbed = new EmbedBuilder()
				.setTitle("Error")
				.setDescription(error.message)
				.setColor("Red")
				.setFooter({
					text: "Reminder",
					iconURL: interaction.user.displayAvatarURL(),
				})

			return interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			})
		}
	},
}
