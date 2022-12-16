const express = require("express");

const Room = require("../schemas/room");
const Chat = require("../schemas/chat");
const router = express.Router();

router.get("/", async (req, res, next) => {
	try {
		const rooms = await Room.find({});
		res.render("main", { rooms, title: "GIF 채팅방" });
	} catch (err) {
		console.error(err);
		next(err);
	}
});

router.get("/room", (req, res) => {
	res.render("room", { title: "GIF 채팅방 생성" });
});

router.post("/room", async (req, res, next) => {
	try {
		const newRoom = await Room.create({
			title: req.body.title,
			max: req.body.max,
			owner: req.session.owner,
			password: req.body.password,
		});
		const io = req.app.get("io");
		io.of("/room").emit("newRoom", newRoom);
		res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
	} catch (err) {
		console.error(err);
		next(err);
	}
});

module.exports = router;
