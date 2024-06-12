import { TTask } from "../types"
import Reminder from "../database/models/Reminder"

const reminderTracker: TTask = {
	name: "reminderTracker",
	interval: 10000, // 10 seconds in milliseconds
	execute: async (client) => {
		const reminders = await Reminder.find({ sent: false })
		const now = Date.now()

		for (const reminder of reminders) {
			const { userId, message, timestamp, sent } = reminder

			if (sent) continue
			const timeLeft = timestamp - now

			if (timeLeft <= 0) {
				const user = await client.users.fetch(userId)
				await user.send(`⏰ **Reminder:** ${message}`).catch(() => {})
				await Reminder.updateOne({ _id: reminder._id }, { sent: true })
			} else if (timeLeft <= 10000) {
				setTimeout(async () => {
					const user = await client.users.fetch(userId)
					await user
						.send(`⏰ **Reminder:** ${message}`)
						.catch(() => {})
					await Reminder.updateOne(
						{ _id: reminder._id },
						{ sent: true }
					)
				}, timeLeft)
			}
		}
	},
}

export default reminderTracker
