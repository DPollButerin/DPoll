import React from "react";
import { Link, Outlet } from "react-router-dom";
import { HStack, VStack, Container, Heading, Text } from "@chakra-ui/react";
import { Box, Button, ButtonGroup, Flex, Spacer, Wrap } from "@chakra-ui/react";
import MainHeader from "../components/MainHeader";
import NavBarMain from "../components/NavBarMain";
import Accueil1 from "../assets/Accueil1.svg";
import Accueil2 from "../assets/Accueil2.svg";
import Accueil3 from "../assets/Accueil3.svg";
import { motion } from "framer-motion";

const Home = () => {
  return (
    // <motion.div
    //   initial={{ opacity: "0" }}
    //   animate={{ opacity: "1" }}
    //   transition={{ duration: 2 }}
    // >
    <Box h="100vh" bg="#E8E8E8">
      <MainHeader />
      <Flex>
        <NavBarMain />
        <Container>
          <Accueil1 style={{ width: "150%", height: "auto" }} />
        </Container>
      </Flex>
    </Box>
    // {/* </motion.div> */}
  );
};

export default Home;
