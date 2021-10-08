const { ERROR } = require("../constants/messages");

function validateNickname(nickname, roomMembers) {
  const maxLength = 10;
  const validation = {
    result: true,
  };

  const isNotString = typeof nickname === "string";

  if (!isNotString) {
    validation.result = false;
    validation.message = ERROR.INVALID_NICKNAME_TYPE;

    return validation;
  }

  const isTooLong = nickname.length > maxLength;

  if (isTooLong) {
    validation.result = false;
    validation.message = ERROR.TOO_LONG_NICKNAME;

    return validation;
  }

  const isDuplicated = roomMembers.some((roomMember) => (
    roomMember === nickname
  ));

  if (isDuplicated) {
    validation.result = false;
    validation.message = ERROR.DUPLICATED_NICKNAME;

    return validation;
  }

  return validation;
}

function getRandomNickname(roomMembers) {
  const baseString = "anonymous";
  let nickname = "anonymous0";

  for (let i = 0; i < roomMembers.length + 1; i++) {
    nickname = `${baseString}${i}`;

    console.log(nickname);
    if (!roomMembers.includes(nickname)) {
      break;
    }
  }

  return nickname;
}

module.exports = { validateNickname, getRandomNickname };
