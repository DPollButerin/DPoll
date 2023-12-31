/**
 * @name getUUID
 * @description generate a UUID v4
 * @see https://stackoverflow.com/a/2117523/1168342
 * @returns  {string} UUID v4
 */
const getUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const statusToString = (status) => {
  const statusList = [
    "initialized",
    "submitted",
    "validated",
    "whitelistRegistering",
    "started",
    "endend",
  ];
  return statusList[status];
};

export { getUUID, statusToString };
