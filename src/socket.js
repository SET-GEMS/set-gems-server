const { Server } = require("socket.io");

function createWsServer(httpServer) {
  const wsServer = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  wsServer.on("connection", (socket) => {
    socket.on("knock", (roomName, nickname, done) => {
      const maxRoomMemberCounts = 4;
      const roomMemberIds = socket.adapter.rooms.get(roomName) || new Set();

      if (roomMemberIds.size === maxRoomMemberCounts) {
        return socket.emit("full_room");
      }

      socket.join(roomName);

      if (nickname) {
        socket.nickname = nickname;
      } else {
        socket.nickname = `anonymous${roomMemberIds.size}`;
      }

      socket.isReady = false;

      done(socket.nickname);
    });

    socket.on("join_room", (roomName) => {
      const roomMemberIds = socket.adapter.rooms.get(roomName);
      const roomMembers = roomMemberIds ? [...roomMemberIds]
        .filter((socketId) => socketId !== socket.id)
        .map((socketId) => {
          const memberSocket = wsServer.sockets.sockets.get(socketId);
          const { nickname, isReady } = memberSocket;

          return { id: socketId, nickname, isReady };
        }) : [];

      const newPlayer = {
        id: socket.id,
        nickname: socket.nickname,
        isReady: false,
      };

      socket.emit("joined", roomMembers);
      socket.to(roomName).emit("new_player", newPlayer);
    });

    socket.on("signal", (data, playerId) => {
      socket.to(playerId).emit("signal", data, socket.id);
    });

    socket.on("chat", (roomName, message) => {
      socket.to(roomName).emit("chat", `${socket.nickname}: ${message}`);
    });

    socket.on("ready", (isReady, roomName) => {
      socket.isReady = isReady;
      socket.to(roomName).emit("ready", isReady, socket.id);
    });

    socket.on("start", (roomName, done) => {
      socket.to(roomName).emit("start");
      done();
    });

    socket.on("set_cards", (roomName, openedCards, remainingCards) => {
      socket.to(roomName).emit("set_cards", openedCards, remainingCards);
    });

    socket.on("select_card", (roomName, cardIndex) => {
      socket.to(roomName).emit("select_card", cardIndex);
      socket.emit("select_card", cardIndex);
    });

    socket.on("exit_room", (roomName) => {
      socket.leave(roomName);
      socket.nickname = "";
      socket.isReady = false;

      socket.to(roomName).emit("player_left", socket.id);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomName) => {
        socket.to(roomName).emit("player_left", socket.id);
      });
    });

    socket.on("error", (err) => {
      console.error(err);
    });
  });
}

module.exports = createWsServer;
