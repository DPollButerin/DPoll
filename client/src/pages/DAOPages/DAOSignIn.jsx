import React from "react";
import { Button, Center, Box, Text, VStack } from "@chakra-ui/react";

const DAOSignIn = () => {
  return (
    <Center h="90vh">
      {/* <Container> */}
      <VStack>
        <Text>Vous devrez verser 0.02eth à la DAO.</Text>{" "}
        <Text>Cette somme sera bloquée pendant 28 jours.</Text>
        <Text>Vous ne pourrez donc quittez la DAO avant 28 jours.</Text>
        {/* </Container> */}
        <Button mt="10">Devenir membre</Button>
      </VStack>
    </Center>
  );
};

export default DAOSignIn;
