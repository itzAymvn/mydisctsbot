/**
 * Trivia model
 * @param {String} userId - Discord user ID
 * @param {Number} totalCorrect - Total correct answers
 * @param {Number} totalEasy - Total easy questions answered
 * @param {Number} totalMedium - Total medium questions answered
 * @param {Number} totalHard - Total hard questions answered
 * @param {Number} points - Total points
 */

import { Schema, model } from "mongoose"
import { ITrivia } from "../../types"

const triviaSchema = new Schema<ITrivia>({
	userId: String, // Discord user ID
	totalCorrect: Number, // Total correct answers
	totalEasy: Number, // Total easy questions answered
	totalMedium: Number, // Total medium questions answered
	totalHard: Number, // Total hard questions answered
	points: Number, // Total points
})

const Trivia = model<ITrivia>("Trivia", triviaSchema)

export default Trivia
