// import React from "react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { VStack } from "@chakra-ui/react";
import NavButton from "./NavButton";
import { getUUID } from "../utils/helpers";
import { useConnection } from "../contexts/ConnectionContext";
import { toShortAddress } from "../utils/connectionUtils";

/**
 * @name NavBarOption
 * @description it is a vertical stack of buttons to navigate in the dapp subpages
 * @dev the buttons are displayed only if wallet is connected
 * @param {Object} - array of objects with details of each button (text, icon, to)
 * @returns {JSX.Element}
 */
const NavBarOption = ({ details }) => {
  const [account, setAccount] = useState(null);
  const { wallet } = useConnection();

  useEffect(() => {
    // console.log(
    //   "ConnectButton useEffect :\naccount : %s \nwallet : %s",
    //   account,
    //   wallet
    // );
    if (wallet) {
      setAccount(toShortAddress(wallet.accounts[0]));
    } else {
      setAccount(null);
    }
  }, [wallet, account]);

  return (
    <VStack w="100%" style={{ backgroundColor: "orange" }}>
      <header style={{ color: "red" }}>
        <h1>NAVABR </h1>
      </header>
      {account
        ? details.map((detail) => {
            console.log("detail LOOP", detail);
            return <NavButton key={detail.to + getUUID} detail={detail} />;
          })
        : null}

      <Outlet context={{ hello: "From Respondent navbar" }} />
    </VStack>
  );
};

export default NavBarOption;
