// 채팅방 코드
const cookieParser = require("cookie-parser");
const SocketIO = require("socket.io");
const axios = require("axios");
const cookie = require("cookie-signature");

module.exports = (server, app, sessionMiddleware) => {
	const io = SocketIO(server, { path: "/socket.io" });
	app.set("io", io); // req.app.get('io') 나중에 이렇게 사용할 수 있음
	const room = io.of("/room");
	const chat = io.of("/chat");

	io.use((socket, next) => {
		// 미들웨어 확장 패턴
		cookieParser(process.env.COOKIE_SECRET)(
			socket.request,
			socket.request.res || {},
			next,
		);
		sessionMiddleware(socket.request, socket.request.res || {}, next);
	});

	room.on("connection", (socket) => {
		console.log("room 네임스페이스에 접속");
		socket.on("disconnect", () => {
			console.log("room 네임스페이스 접속 해제");
		});
	});

	chat.on("connection", (socket) => {
		console.log("chat 네임스페이스에 접속");
		const req = socket.request;
		const {
			headers: { referer },
		} = req;
		const roomId = referer
			.split("/")
			[referer.split("/").length - 1].replace(/\?.+/, "");

		socket.join(roomId);

		socket.to(roomId).emit("join", {
			user: "system",
			chat: `test 님이 입장하셨습니다.`,
		});

		socket.on("disconnect", () => {
			console.log("chat 네임스페이스 접속 해제");
			socket.leave(roomId);
			let currentRoom = "";

			socket.adapter.rooms.forEach((element, key, set) => {
				// console.log("key: ", key);
				// console.log("element: ", element);
				// console.log("set: ", set);
				key === roomId ? (currentRoom = element) : null;
			});

			const userCount = currentRoom ? currentRoom.size : 0;
			if (userCount === 0) {
				// user가 0명이면 방 삭제
				// const signedCookie = cookie.sign(
				// 	req.signedCookies["connect.sid"],
				// 	process.env.COOKIE_SECRET,
				// );
				// const connectSID = `${signedCookie}`;
				axios
					.delete(
						`http://localhost:8005/room/${roomId}`,
						// 	, {
						// 	headers: {
						// 		Cookie: `connect.sid=s%3A${connectSID}`,
						// 	},
						// }
					)
					.then(() => {
						console.log(`${roomId}방 제거 요청 성공`);
					})
					.catch((error) => {
						console.error(error);
					});
			} else {
				socket.to(roomId).emit("exit", {
					user: "system",
					chat: `test 님이 퇴장하셨습니다`,
				});
			}
		});

		socket.on("chat", (data) => {
			socket.to(data.room).emit(data);
		});
	});
};

// //socket.io 사용하는 코드

// const SocketIo = require("socket.io");

// module.exports = (server) => {
// 	const io = SocketIo(server, { path: "/socket.io" });

// 	io.on("connection", (socket) => {
// 		// 웹 소켓 연결 시
// 		const req = socket.request;
// 		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
// 		console.log("새로운 클라이언트 접속!", ip, socket.id, req.ip);

// 		// 연결 종료 시
// 		socket.on("disconnect", () => {
// 			console.log("클라이언트 접속 해제", ip, socket.id);
// 			clearInterval(socket.interval);
// 		});

// 		// 에러 처리 핸들러
// 		socket.on("error", (error) => {
// 			console.error(error);
// 		});

// 		// 클라이언트로부터 메시지
// 		socket.on("reply", (data) => {
// 			console.log(data);
// 		});

// 		// news 라는 이벤트에 hello Socket.IO 보내라는 뜻
// 		socket.interval = setInterval(() => {
// 			socket.emit("news", "Hello Socket.IO");
// 		}, 3000);
// 	});
// };

// // websocket 사용하는 코드

// const WebSocket = require("ws");

// module.exports = (server) => {
// 	const wss = new WebSocket.Server({ server });

// 	wss.on("connection", (ws, req) => {
// 		// 프론트에서 연결 실행시
// 		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // ip파악
// 		console.log("새로운 클라이언트 접속", ip);

// 		// 클라이언트로부터 온 메시지
// 		ws.on("message", (message) => {
// 			console.log(message);
// 		});

// 		// 에러처리 핸들러
// 		ws.on("error", (error) => {
// 			console.error(error);
// 		});

// 		// 연결 종료시
// 		ws.on("close", () => {
// 			console.log("클라이언트 접속 해제", ip);
// 			clearInterval(ws.interval);
// 		});

// 		ws.interval = setInterval(() => {
// 			// 3초마다 클라이언트로 메시지 전송
// 			if (ws.readyState === ws.OPEN) {
// 				// 연결된 상태를 검사
// 				ws.send("서버에서 클라이언트로 메시지를 보냅니다.");
// 			}
// 		}, 3000);
// 	});
// };
