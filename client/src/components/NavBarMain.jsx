import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Button, Box, VStack } from "@chakra-ui/react";
// import Accueil3 from "../assets/Accueil3.svg";

/*
refactor button in styled component
*/
/**
 * @name NavBarMain
 * @description NavBarMain component is a vertical stack of buttons to navigate in the dapp main pages
 * @dev the buttons are always displayed as it's the presentation pages of each subpage
 * @param {Object}
 * @returns {JSX.Element}
 */
const NavBarMain = () => {
  return (
    <VStack
      h="40vh"
      p="5em"
      style={{ backgroundColor: "#E8E8E8", width: "30vw" }}
    >
      {/* <Button
        as={Link}
        to="/"
        color="#43B9C1"
        bg="#E8E8E8"
        my="3"
        style={{
          width: "100%",
          height: "7vh",
          // backgroundColor: "#E8E8E8",
          // color: "#43B9C1",
          fontSize: "1.7rem",
          textDecorationLine: "underline",
          textDecorationThickness: "2px",
          border: "3px solid #036681",
          borderRadius: "10px",
          justifyContent: "flex-start",
          paddingLeft: "2em",
        }}
        _hover={{ bg: "#faf9df" }}
        _focus={{
          color: "#036681",
        }}
        _active={{
          color: "#036681",
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        Acceuil
      </Button> */}
      <Button
        as={Link}
        to="/Respondent"
        color="#43B9C1"
        bg="#E8E8E8"
        my="3"
        style={{
          width: "100%",
          height: "5vh",
          // backgroundColor: "#E8E8E8",
          // color: "#43B9C1",
          fontSize: "1.7rem",
          textDecorationLine: "underline",
          textDecorationThickness: "2px",
          border: "3px solid #036681",
          borderRadius: "10px",
          justifyContent: "flex-start",
          paddingLeft: "2em",
        }}
        _hover={{ bg: "#faf9df" }}
        _focus={{
          color: "#036681",
        }}
        _active={{
          color: "#036681",
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        Répondant
      </Button>
      <Button
        as={Link}
        to="/Creator"
        color="#43B9C1"
        bg="#E8E8E8"
        my="3"
        style={{
          width: "100%",
          height: "5vh",
          // backgroundColor: "#E8E8E8",
          // color: "#43B9C1",
          fontSize: "1.7rem",
          textDecorationLine: "underline",
          textDecorationThickness: "2px",
          border: "3px solid #036681",
          borderRadius: "10px",
          justifyContent: "flex-start",
          paddingLeft: "2em",
        }}
        _hover={{ bg: "#faf9df" }}
        _focus={{
          color: "#036681",
        }}
        _active={{
          color: "#036681",
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        Créateur
      </Button>
      <Button
        as={Link}
        to="/DAO"
        color="#43B9C1"
        bg="#E8E8E8"
        my="3"
        style={{
          width: "100%",
          height: "5vh",
          // backgroundColor: "#E8E8E8",
          // color: "#43B9C1",
          fontSize: "1.7rem",
          textDecorationLine: "underline",
          textDecorationThickness: "2px",
          border: "3px solid #036681",
          borderRadius: "10px",
          justifyContent: "flex-start",
          paddingLeft: "2em",
        }}
        _hover={{ bg: "#faf9df" }}
        _focus={{
          color: "#036681",
        }}
        _active={{
          color: "#036681",
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        DAO
      </Button>
      <Button
        as={Link}
        to="/About"
        color="#43B9C1"
        bg="#E8E8E8"
        mt="3"
        mb="20"
        style={{
          width: "100%",
          height: "5vh",
          // backgroundColor: "#E8E8E8",
          // color: "#43B9C1",
          fontSize: "1.7rem",
          textDecorationLine: "underline",
          textDecorationThickness: "2px",
          border: "3px solid #036681",
          borderRadius: "10px",
          justifyContent: "flex-start",
          paddingLeft: "2em",
        }}
        _hover={{ bg: "#faf9df" }}
        _focus={{
          color: "#036681",
        }}
        _active={{
          color: "#036681",
          boxShadow:
            "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
        }}
      >
        Aide
      </Button>
      {/* </Flex> */}
      {/* <Box>
        <Accueil3 style={{ width: "400%", height: "auto" }} />
      </Box> */}
      <Outlet context={{ hello: "From Outlet" }} />
    </VStack>
  );
};

export default NavBarMain;
//  {/* <div>Home</div> */}

//     {/* <header style={{ backgroundColor: "gray" }}>
//       <h1>HOME Header</h1>
//     </header>
//     {/* <Flex p="10em" style={{ backgroundColor: "yellow" }}> */}
//     {/* <h1>HOME</h1> */ */}
