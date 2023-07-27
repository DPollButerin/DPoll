import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  VStack,
  Spacer,
  Text,
  Wrap,
} from "@chakra-ui/react";
import ConnectButton from "./ConnectButton";
import Accueil2 from "../assets/Accueil2.svg";

const MainHeader = () => {
  return (
    <Flex h="33%">
      <Box pl="25" pt="10">
        <Heading pl="10" color="#43B9C1" style={{ fontSize: "7rem" }}>
          D-POLL
        </Heading>
        <Text pl="10" color="#43B9C1" style={{ fontSize: "1.7rem" }}>
          La plateforme de sondages décentralisés
        </Text>
      </Box>
      <Spacer />
      <Box width="50vw">
        <Flex pt="10" pr="5" minWidth="max-content" alignItem="flex-end">
          <ButtonGroup>
            <Button
              color="#43B9C1"
              bg="#E8E8E8"
              my="2"
              style={{
                border: "2px solid #036681",
                paddingLeft: "2em",
                // height: "15vh",
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
              Comment ça marche ?
            </Button>
            <Button
              color="#43B9C1"
              bg="#E8E8E8"
              my="2"
              style={{
                border: "2px solid #036681",
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
              Lite Paper
            </Button>
          </ButtonGroup>
          <Spacer />
          <ConnectButton />
        </Flex>
        {/* </ButtonGroup> */}
        <Flex>
          <Box width="10vw" pr="5" pt="10" pb="10">
            <Accueil2 style={{ width: "100%" }} />
          </Box>
          <VStack pl="20" pt="20">
            <Box>
              <Text style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                Confidentialité, sécurité, efficacité.
              </Text>
            </Box>
            <Box>
              <Text style={{ fontSize: "1.3rem" }}>
                Le monde du sondage entre dans une nouvelle ère
              </Text>
            </Box>
          </VStack>
        </Flex>
      </Box>
    </Flex>
  );
};

export default MainHeader;
// style={{ width: "20wv", height: "100%" }} />
