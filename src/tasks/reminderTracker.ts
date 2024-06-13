import { TTask } from "../types"
import Reminder from "../database/models/Reminder"

const reminderTracker: TTask = {
	name: "reminderTracker",
	interval: 10000, // 10 seconds in milliseconds
	execute: async (client) => {
		const reminders = await Reminder.find({ sent: false })
		const remindersSent: any = []
		const now = Date.now()

		for (const reminder of reminders) {
			const { userId, message, timestamp, sent } = reminder

			if (sent) continue
			const timeLeft = timestamp - now

			if (timeLeft <= 0) {
				const user = await client.users.fetch(userId)
				await user.send(`⏰ **Reminder:** ${message}`).catch(() => {})
				remindersSent.push(reminder._id)
			} else if (timeLeft <= 10000) {
				setTimeout(async () => {
					const user = await client.users.fetch(userId)
					await user
						.send(`⏰ **Reminder:** ${message}`)
						.catch(() => {})
					remindersSent.push(reminder._id)
				}, timeLeft)
			}
		}

		if (remindersSent.length) {
			await Reminder.updateMany(
				{ _id: { $in: remindersSent } },
				{ sent: true }
			)
		}
	},
}

export default reminderTracker
