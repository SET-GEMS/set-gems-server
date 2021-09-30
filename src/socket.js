const { Server } = require("socket.io");

function createWsServer(httpServer) {
  const wsServer = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  wsServer.on("connection", socket => {
    socket.on("join_room", (roomName, nickname) => {
      const roomMemberSet = socket.adapter.rooms.get(roomName);
      const roomMembers = roomMemberSet ? [...roomMemberSet] : [];

      if (nickname) {
        socket.nickname = nickname;
      } else {
        socket.nickname = `anonymous${roomMembers.length}`;
      }

      socket.join(roomName);

      socket.emit("joined", roomMembers);
      socket.to(roomName).emit("new_user", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("disconnect");
    });

    socket.on("error", err => {
      console.error(err);
    });
  });
}

module.exports = createWsServer;
