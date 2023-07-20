import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  Wrap,
} from "@chakra-ui/react";
import ConnectButton from "./ConnectButton";

const MainHeader = () => {
  return (
    <Flex h="33%">
      <Box>
        <Heading size="4xl">D-POLL</Heading>
        <Text>La plateforme de sondags décentralisés</Text>
      </Box>
      <Spacer />
      <Box>
        <ButtonGroup>
          <Button>Comment ça marche ?</Button>
          <Button>Lite Paper</Button>
          <ConnectButton />
        </ButtonGroup>
        <HStack>
          LOGO
          <Wrap>
            <Text>Confidentialité, sécurité, efficacité.</Text>
            <Text>Le monde du sondage entre dans une nouvelle ère</Text>
          </Wrap>
        </HStack>
      </Box>
    </Flex>
  );
};

export default MainHeader;
