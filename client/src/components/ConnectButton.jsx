import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import MetamaskIcon from "../assets/metamask.svg";
import { useConnection } from "../contexts/ConnectionContext";
import { toShortAddress } from "../utils/connectionUtils";

/**
 * @name ConnectButton
 * @description ConnectButton component is a button to connect/disconnect wallet to the dapp
 * @dev the button connect/disconnect the dapp
 * @dev if user is in subpage (!= Home, Respondent, Creator, DAO) and disconnect, he is redirected to Home
 * @param {Object} props
 * @returns
 */
const ConnectButton = () => {
  const [account, setAccount] = useState(null);
  const { wallet, handleConnect, handleDisconnect } = useConnection();
  const location = useLocation();
  const navigate = useNavigate();

  const handleOnClick = () => {
    // console.log(
    //   "ConnectButton handleOnClick :\naccount : %s \nwallet : %s",
    //   account,
    //   wallet
    // );
    const pathToStay = [
      "/",
      "/Home",
      "/About",
      "/Respondent",
      "/Creator",
      "/DAO",
    ];
    // console.log(
    //   "is PATH OK TO STAY : ",
    //   pathToStay.includes(location.pathname)
    // );
    if (!account) {
      console.log("ConnectButton handleOnClick !wallet => connect");
      handleConnect();
    } else {
      if (!pathToStay.includes(location.pathname)) {
        console.log("(ConnectButton)/DISCONNECT in subpage => go Home!");
        navigate("/");
      }
      setAccount(null);
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

  //   useEffect(() => {
  //     console.log(
  //       "(ConnectButton)/WATCHER ACCOUNT0 CONNECTION : ",
  //       wallet.accounts[0]
  //     );
  //   }, [wallet.accounts]);

  //   useEffect(() => {
  //     console.log("(ConnectButton)/WWATCHER ACCOUNT LOGGED : ", account);
  //   }, [account]);

  return (
    <Button
      mt="2"
      mr="2"
      onClick={handleOnClick}
      rightIcon={<MetamaskIcon style={{ height: "2rem", width: "2rem" }} />}
      bg="#E8E8E8"
      style={{
        // backgroundColor: "#E8E8E8",
        color: "#43b9C1",
        border: "2px solid #036681",
        borderRadius: "1.5rem",
      }}
      _hover={{ bg: "#faf9df" }}
      _focus={{
        boxShadow:
          "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
      }}
    >
      {account ? account : "Connect Wallet"}
    </Button>
  );
};

export default ConnectButton;
