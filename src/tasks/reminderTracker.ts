import { IReminder, TTask } from "../types"
import Reminder from "../database/models/Reminder"
import cache from "../utils/cacheManager"

const reminderTracker: TTask = {
	name: "reminderTracker",
	interval: 10000, // 10 seconds in milliseconds
	execute: async (client) => {
		let reminders: IReminder[] = []
		const cachedReminders = await cache.get("reminders")

		if (!cachedReminders) {
			reminders = await Reminder.find()
			await cache.set("reminders", reminders)
		} else {
			reminders = cachedReminders
		}

		const now = Date.now()

		for (const reminder of reminders) {
			const { userId, message, timestamp, sent } = reminder

			if (sent) continue
			const timeLeft = timestamp - now

			if (timeLeft <= 0) {
				const user = await client.users.fetch(userId)
				await user.send(`⏰ **Reminder:** ${message}`)
				await Reminder.updateOne({ _id: reminder._id }, { sent: true })

				reminders = reminders.filter((r) => r._id !== reminder._id)
				await cache.set("reminders", reminders)
			} else if (timeLeft <= 10000) {
				// Time left is within the next interval
				setTimeout(async () => {
					const user = await client.users.fetch(userId)
					await user.send(`⏰ **Reminder:** ${message}`)
					await Reminder.updateOne(
						{ _id: reminder._id },
						{ sent: true }
					)

					reminders = reminders.filter((r) => r._id !== reminder._id)
					await cache.set("reminders", reminders)
				}, timeLeft)
			}
		}
	},
}

export default reminderTracker
