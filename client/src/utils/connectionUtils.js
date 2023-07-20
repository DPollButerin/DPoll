/**
 * @module connectionUtils
 * @desc Utils for connection
 * @dev This module is used to check if the chain is valid, to convert chainId to chainName and to convert address to short address
 * @example
 * const { isChainValid, chainIdToName, toShortAddress } = require('./connectionUtils.js')
 * console.log(isChainValid('0x5')) // true
 * console.log(chainIdToName('0x5')) // goerli
 * console.log(toShortAddress('0xCAfg123F5d....Ce21Eb06')) // 0xCAfg...Eb06
 */
module.exports = {
  isChainValid: (chainId) => {
    /* goerli, sepolia, ganache */
    return chainId === "0x5" || chainId === "0xaaa36a7" || chainId === "0x539";
  },
  chainIdToName: (chainId) => {
    switch (chainId) {
      case "0x5":
        return "goerli";
      case "0xaaa36a7":
        return "sepolia";
      case "0x539":
        return "ganache";
      default:
        return "Unknown";
    }
  },
  toShortAddress: (address) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  },
};
