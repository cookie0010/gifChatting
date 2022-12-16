const mongoose = require("mongoose");

const { Schema } = mongoose;
const {
	Types: { ObjectId },
} = Schema;
const chatSchema = new Schema({
	room: {
		type: ObjectId,
		required: true,
		ref: "Room", // 나중에 mongoose가 populate로 두 정보를 합쳐 준다.
	},
	user: {
		type: String,
		required: true,
	},
	chat: String,
	gif: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Chat", chatSchema);
