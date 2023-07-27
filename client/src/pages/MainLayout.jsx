import React from "react";
import { Link, Outlet, Routes, Route } from "react-router-dom";
// import RespondentNavBar from "./RespondentPages/RespondentNavBar";

import { matchRoutes, useLocation } from "react-router-dom";
import NavBarOption from "../components/NavBarOption";
import { Box, Button, Flex, Spacer, VStack } from "@chakra-ui/react";
import NavButton from "../components/NavButton";
import { group, single } from "../utils/navLinks";
// import InlineSVG from "svg-inline-react";
import ConnectButton from "../components/ConnectButton";
import { motion } from "framer-motion";

const useCurrentPath = () => {
  const routes = [{ path: "/" }];
  const location = useLocation();
  // console.log("INcurrentPAtHlocation", location);
  // console.log("routes", routes);
  // const [{ route }] = matchRoutes(routes, location);
  // return route.path;
  return location.pathname;
};

/*
todo: semantic navigation => nav!
*/
const MainLayout = () => {
  const currentPath = useCurrentPath(); // `/members/5566` -> `/members/:id`

  return (
    // <motion.div
    //   initial={{ opacity: "0" }}
    //   animate={{ opacity: "1" }}
    //   transition={{ duration: 2 }}
    // >
    <Box h="96vh" my="0" p="0" style={{ backgroundColor: "#E8E8E8" }}>
      <Flex my="0" pl="0" py="0" style={{ backgroundColor: "marron" }}>
        {/* <header style={{ backgroundColor: "green", fontSize: "1.1rem" }}>
          <h1>RoomLayout Header Pat pour action : {currentPath}</h1>
        </header> */}
        <header
          style={{
            backgroundColor: "#036681",
            color: "#E8E8E8",
            fontSize: "2.7rem",
            width: "20vw",
            textAlign: "center",
          }}
        >
          <h1>D-Poll</h1>
        </header>
        <Spacer />

        <ConnectButton />
      </Flex>
      <Flex
        my="0"
        pt="0"
        style={{ backgroundColor: "#E8E8E8", height: "100%" }}
      >
        <Box m="0" p="0" style={{ border: "0px solid black", width: "20vw" }}>
          <VStack py="20" h="100%" style={{ backgroundColor: "#036681" }}>
            <NavButton mt={5} detail={single.home} />
            <NavButton detail={single.respondent} />
            <NavButton detail={single.creator} />
            <NavButton detail={single.dao} />
            {/* </VStack> */}
            <Spacer />
            <Routes style={{ backgroundColor: "blue" }}>
              <Route
                path="/Respondent/*"
                element={<NavBarOption details={group.respondent} />}
              />
              <Route
                path="/Creator/*"
                element={<NavBarOption details={group.creator} />}
              />
              <Route
                path="/DAO/*"
                element={<NavBarOption details={group.dao} />}
              />
            </Routes>
            <Spacer />
            <NavButton detail={single.about} />
          </VStack>
        </Box>

        <Box my="0" p="0" style={{ backgroundColor: "#E8E8E8", width: "75vw" }}>
          {/* <header style={{ backgroundColor: "cyan" }}>
            <h1>MAINLAYOUT pager</h1>
          </header> */}
          <Outlet context={{ hello: "From OutletMAinLayout" }} />
        </Box>
      </Flex>
    </Box>
    // </motion.div>
  );
};

export default MainLayout;
