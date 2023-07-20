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
      style={{ width: "80%" }}
    >
      {detail.text}
    </Button>
  );
};

export default NavButton;
