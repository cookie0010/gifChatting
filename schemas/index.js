const mongoose = require("mongoose");

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://localhost:27017/gifchat`;

const connect = () => {
	if (NODE_ENV !== "production") {
		mongoose.set("debug", true);
	}
	mongoose.connect(
		MONGO_URL,
		{
			dbName: "gifchat",
			useNewUrlParser: true,
			// useCreateIndex: true,
		},
		(error) => {
			if (error) {
				console.log("몽고디비 연결 에러", error);
			} else {
				console.log("몽고디비 연결 성공");
			}
		},
	);
};

module.exports = connect;
