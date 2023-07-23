import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@chakra-ui/react";

/*
nav button for main layout and submenus (NavBarOption)
*/
const NavButton = ({ detail }) => {
  console.log("detail", detail);
  return (
    <Button
      leftIcon={detail.icon}
      as={Link}
      to={detail.to}
      color="#43B9C1"
      bg="#E8E8E8"
      style={{
        width: "80%",
        // backgroundColor: "#E8E8E8",
        // color: "#43B9C1",
        fontSize: "1.3rem",
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
      {detail.text}
    </Button>
  );
};

export default NavButton;
