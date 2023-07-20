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
