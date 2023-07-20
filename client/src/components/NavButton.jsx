import React from "react";
import { Link } from "react-router-dom";
import { Button, IconButton } from "@chakra-ui/react";
import { FaPlus, FaAccusoft, FaNfcDirectional } from "react-icons/fa6";
import { EmailIcon } from "@chakra-ui/icons";
import { Box, Icon } from "@chakra-ui/react";

const NavButton = ({ detail }) => {
  console.log("detail", detail);
  return (
    // <Box
    //   as="button"
    //   height="24px"
    //   lineHeight="1.2"
    //   transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
    //   border="1px"
    //   px="8px"
    //   borderRadius="6px"
    //   fontSize="14px"
    //   fontWeight="semibold"
    //   bg="#f5f6f7"
    //   borderColor="#ccd0d5"
    //   color="#4b4f56"
    //   _hover={{ bg: "#ebedf0" }}
    //   _active={{
    //     bg: "#dddfe2",
    //     transform: "scale(0.98)",
    //     borderColor: "#bec3c9",
    //   }}
    //   _focus={{
    //     boxShadow:
    //       "0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)",
    //   }}
    // >
    //   {/* <Icon as={icon} /> */}
    //   {icon}
    //   <Icon as={FaPlus} />
    //   {/* <Button leftIcon={FaPlus} as={Link} to={to} style={{ width: "80%" }}>
    //     {text}
    //   </Button> */}
    //   <Link to={to} style={{ width: "80%" }}>
    //     {text}
    //   </Link>
    // </Box>
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
