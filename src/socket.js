const { Server } = require("socket.io");
const { KNOCK, FULL_ROOM, JOIN_ROOM, NEW_PLAYER, JOINED, SIGNAL, CHAT, READY, START, SET_CARDS, SELECT_CARD, EXIT_ROOM, DISCONNECTING, NEW_LEADER, PLAYER_LEFT } = require("./constants/socketEvents");

function createWsServer(httpServer) {
  const wsServer = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
    },
  });

  wsServer.on("connection", (socket) => {
    socket.on(KNOCK, (roomName, nickname, done) => {
      const maxRoomMemberCounts = 4;
      const roomMemberIds = socket.adapter.rooms.get(roomName) || new Set();

      if (roomMemberIds.size === maxRoomMemberCounts) {
        return socket.emit(FULL_ROOM);
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

    socket.on(JOIN_ROOM, (roomName) => {
      const roomMemberIds = socket.adapter.rooms.get(roomName);
      const roomMembers = roomMemberIds ? [...roomMemberIds]
        .filter((socketId) => socketId !== socket.id)
        .map((socketId) => {
          const memberSocket = wsServer.sockets.sockets.get(socketId);
          const { nickname, isReady } = memberSocket;

          return { id: socketId, nickname, isReady };
        }) : [];

      if (roomMembers.length) {
        const newPlayer = {
          id: socket.id,
          nickname: socket.nickname,
          isReady: false,
        };

        socket.to(roomName).emit(NEW_PLAYER, newPlayer);
      } else {
        socket.isLeader = true;
      }

      socket.emit(JOINED, roomMembers);
    });

    socket.on(SIGNAL, (data, playerId) => {
      socket.to(playerId).emit(SIGNAL, data, socket.id);
    });

    socket.on(CHAT, (roomName, message) => {
      socket.to(roomName).emit(CHAT, `${socket.nickname}: ${message}`);
    });

    socket.on(READY, (isReady, roomName) => {
      socket.isReady = isReady;
      socket.to(roomName).emit(READY, isReady, socket.id);
    });

    socket.on(START, (roomName, done) => {
      socket.to(roomName).emit(START);
      done();
    });

    socket.on(SET_CARDS, (roomName, openedCards, remainingCards) => {
      socket.to(roomName).emit(SET_CARDS, openedCards, remainingCards);
    });

    socket.on(SELECT_CARD, (roomName, cardIndex) => {
      socket.to(roomName).emit(SELECT_CARD, cardIndex);
      socket.emit(SELECT_CARD, cardIndex);
    });

    socket.on(EXIT_ROOM, (roomName) => {
      handlePlayerLeft(roomName, socket);
    });

    socket.on(DISCONNECTING, () => {
      socket.rooms.forEach((roomName) => {
        handlePlayerLeft(roomName, socket);
      });
    });

    function handlePlayerLeft(roomName, socket) {
      socket.leave(roomName);
      socket.to(roomName).emit(PLAYER_LEFT, socket.id);

      const roomMemberIds = socket.adapter.rooms.get(roomName);

      if (socket.isLeader && roomMemberIds) {
        const newLeaderId = [...roomMemberIds][0];
        const newLeader = wsServer.sockets.sockets.get(newLeaderId);
        newLeader.isReady = false;
        newLeader.isLeader = true;

        socket.to(roomName).emit(NEW_LEADER, newLeaderId);
      }
    }
  });
}

module.exports = createWsServer;
