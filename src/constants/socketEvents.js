const SOCKET_EVENTS = {
  CONNECT_ERROR: "connect_error",
  CONNECT_FAILED: "connect_failed",
  DISCONNECTING: "disconnecting",
  FULL_ROOM: "full_room",
  JOIN_ROOM: "join_room",
  KNOCK: "knock",
  EXIT_ROOM: "exit_room",
  JOINED: "joined",
  NEW_PLAYER: "new_player",
  SIGNAL: "signal",
  CHAT: "chat",
  READY: "ready",
  START: "start",
  PLAYER_LEFT: "player_left",
  NEW_LEADER: "new_leader",
  SET_CARDS: "set_cards",
  SELECT_CARD: "select_card",
  GAME_OVER: "game_over",
};

module.exports = SOCKET_EVENTS;
