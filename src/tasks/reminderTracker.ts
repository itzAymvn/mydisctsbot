import { TTask } from "../types"
import Reminder from "../database/models/Reminder"

const remindersWithTimeout: {
	_id: unknown
	timeout: NodeJS.Timeout
}[] = []

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

			// Skip reminders that already have a timeout set
			if (remindersWithTimeout.some((r) => r._id === reminder._id))
				continue

			if (timeLeft <= 0) {
				const user = await client.users.fetch(userId)
				await user.send(`⏰ **Reminder:** ${message}`).catch(() => {})
				await Reminder.updateOne({ _id: reminder._id }, { sent: true })
			} else if (timeLeft <= 10000) {
				const timeout = setTimeout(async () => {
					const user = await client.users.fetch(userId)
					await user
						.send(`⏰ **Reminder:** ${message}`)
						.catch(() => {})
					await Reminder.updateOne(
						{ _id: reminder._id },
						{ sent: true }
					)

					// Remove the reminder from remindersWithTimeout once sent
					const index = remindersWithTimeout.findIndex(
						(r: any) => r._id === reminder._id
					)
					if (index !== -1) {
						remindersWithTimeout.splice(index, 1)
					}
				}, timeLeft)

				// Add the reminder to the remindersWithTimeout array
				remindersWithTimeout.push({ _id: reminder._id, timeout })
			}
		}
	},
}

export default reminderTracker
