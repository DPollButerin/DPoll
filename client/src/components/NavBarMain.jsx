import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Button, VStack } from "@chakra-ui/react";

/**
 * @name NavBarMain
 * @description NavBarMain component is a vertical stack of buttons to navigate in the dapp main pages
 * @dev the buttons are always displayed as it's the presentation pages of each subpage
 * @param {Object}
 * @returns {JSX.Element}
 */
const NavBarMain = () => {
  return (
    <VStack h="100%" p="10em" style={{ backgroundColor: "yellow" }}>
      <div>Home</div>

      <header style={{ backgroundColor: "gray" }}>
        <h1>HOME Header</h1>
      </header>
      {/* <Flex p="10em" style={{ backgroundColor: "yellow" }}> */}
      <h1>HOME</h1>

      <Button as={Link} to="/">
        Acceuil
      </Button>

      <Button as={Link} to="/Respondent">
        Répondant
      </Button>

      <Button as={Link} to="/Creator">
        Créateur
      </Button>

      <Button as={Link} to="/DAO">
        DAO
      </Button>

      <Button as={Link} to="/About">
        Aide
      </Button>
      {/* </Flex> */}
      <Outlet context={{ hello: "From Outlet" }} />
    </VStack>
  );
};

export default NavBarMain;
