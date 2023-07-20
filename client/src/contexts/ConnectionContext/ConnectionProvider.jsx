import { useEffect, useState } from "react";

import ConnectionContext from "./ConnectionContext";
import detectEthereumProvider from "@metamask/detect-provider";

/*@dev : Helper function to check if the chainId is the one we want to use
@todo : Rename this function and move it to a utils file
@params : chainId
@return : boolean
*/
const isChainValid = (chainId) => {
  /* goerli, sepolia, ganache */
  return chainId === "0x5" || chainId === "0xaaa36a7" || chainId === "0x539";
};

/*
@dev : Provider to manage the connection to the wallet
@dev : install @metamask/detect-provider => npm install @metamask/detect-provider
@notice : see metamask doc for more info
@params : children
@return : children wrapped by ConnectionContext.Provider
@todo : CHECKS if the chain is valid to show a warning (decide here or in component ??)
*/
// DO NOT REMOVE THE NEXT LINE - IT IS USED BY BABEL
// eslint-disable-next-line react/prop-types
const ConnectionProvider = ({ children }) => {
  const [hasProvider, setHasProvider] = useState(null);
  const initialState = {
    accounts: [],
    chainId: "",
  };
  const [wallet, setWallet] = useState(initialState);

  /*
  @dev : useEffect to check if the user has metamask installed and load the accounts and chainId
  it's run only once
  @params : none
  */
  useEffect(() => {
    /* to update the wallet when the accounts change */
    const refreshAccounts = (accounts) => {
      if (accounts.length > 0) {
        updateWallet(accounts);
      } else {
        setWallet(initialState);
      }
    };
    /* to update the wallet when the chainId change */
    const refreshChain = (chainId) => {
      const isNetworkOk = isChainValid(chainId);
      console.log(
        "(ConnectionProvider)/ refreshChain check chain is valid and wallet : ",
        isNetworkOk,
        wallet
      );
      setWallet((wallet) => ({ ...wallet, chainId }));
    };

    /* to check if the user has metamask installed and add listeners to update the wallet */
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(Boolean(provider));

      if (provider) {
        console.log("wallet IFPROVIDER", wallet);
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        refreshAccounts(accounts);
        window.ethereum.on("accountsChanged", refreshAccounts);
        window.ethereum.on("chainChanged", refreshChain); /* New */
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshAccounts);
      window.ethereum?.removeListener("chainChanged", refreshChain); /* New */
    };
  }, []);

  /*
  @dev : update the wallet
  @params : accounts
  */
  const updateWallet = async (accounts) => {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    setWallet({ accounts, chainId });
    console.log("(ConnectionProvider) updateWallet : ", wallet);
  };

  /*
  @dev : connect to the wallet
  @params : none
  */
  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateWallet(accounts);
    console.log("wallet handleConnect", wallet);
  };

  const handleDisconnect = async () => {
    setWallet(initialState);
  };

  return (
    <ConnectionContext.Provider
      value={{ wallet, hasProvider, handleConnect, handleDisconnect }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionProvider;
