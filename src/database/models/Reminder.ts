/**
 * Reminder model
 * @param {String} userId - Discord user ID
 * @param {String} message - Reminder message
 * @param {Number} timestamp - Date to send the reminder (in MS)
 * @param {Boolean} sent - Whether the reminder has been sent
 */

import { Schema, model } from "mongoose"
import { IReminder } from "../../types"

const reminderSchema = new Schema<IReminder>({
	userId: String, // Discord user ID
	message: String, // Reminder message
	timestamp: Number, // Date to send the reminder (in MS)
	sent: Boolean, // Whether the reminder has been sent
})

const Reminder = model<IReminder>("Reminder", reminderSchema)

export default Reminder
