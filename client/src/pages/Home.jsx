import React from "react";
import { Link, Outlet } from "react-router-dom";
import { HStack, VStack, Container, Heading, Text } from "@chakra-ui/react";
import { Box, Button, ButtonGroup, Flex, Spacer, Wrap } from "@chakra-ui/react";
import MainHeader from "../components/MainHeader";
import NavBarMain from "../components/NavBarMain";

const Home = () => {
  return (
    <Box h="100vh" style={{ backgroundColor: "grey" }}>
      <MainHeader />
      <Flex>
        <NavBarMain />
        <Container>LOGO HOME</Container>
      </Flex>
    </Box>
  );
};

export default Home;
