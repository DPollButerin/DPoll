import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import MetamaskIcon from "../assets/metamask.svg";
import { useConnection } from "../contexts/ConnectionContext";
import { toShortAddress } from "../utils/connectionUtils";

const ConnectButton = () => {
  const [account, setAccount] = useState(null);
  const { wallet, handleConnect, handleDisconnect } = useConnection();

  const handleOnClick = () => {
    console.log(
      "ConnectButton handleOnClick :\naccount : %s \nwallet : %s",
      account,
      wallet
    );
    if (!account) {
      console.log("ConnectButton handleOnClick !wallet => connect");
      handleConnect();
    } else {
      console.log("ConnectButton handleOnClick wallet => disconnect");
      handleDisconnect();
    }
  };

  useEffect(() => {
    console.log(
      "ConnectButton useEffect :\naccount : %s \nwallet : %s",
      account,
      wallet
    );
    if (wallet) {
      setAccount(toShortAddress(wallet.accounts[0]));
    }
  }, [wallet, account]);

  return (
    <Button
      as={Link}
      to="/"
      onClick={handleOnClick}
      rightIcon={<MetamaskIcon style={{ height: "30px", width: "30px" }} />}
    >
      {account ? account : "Connect Wallet"}
    </Button>
  );
};

export default ConnectButton;
