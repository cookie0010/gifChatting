const WebSocket = require("ws");

module.exports = (server) => {
	const wss = new WebSocket.Server({ server });

	wss.on("connection", (ws, req) => {
		// 프론트에서 연결 실행시
		const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress; // ip파악
		console.log("새로운 클라이언트 접속", ip);

		// 클라이언트로부터 온 메시지
		ws.on("message", (message) => {
			console.log(message);
		});

		// 에러처리 핸들러
		ws.on("error", (error) => {
			console.error(error);
		});

		// 연결 종료시
		ws.on("close", () => {
			console.log("클라이언트 접속 해제", ip);
			clearInterval(ws.interval);
		});

		ws.interval = setInterval(() => {
			// 3초마다 클라이언트로 메시지 전송
			if (ws.readyState === ws.OPEN) {
				// 연결된 상태를 검사
				ws.send("서버에서 클라이언트로 메시지를 보냅니다.");
			}
		}, 3000);
	});
};
