import { useState } from "react";
import { Center, VStack, Button, Container, Text } from "@chakra-ui/react";
import PresentationCreation from "../../components/PresentationCreation";
import NewPoll from "../../components/NewPoll";

const PollCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleOnCreation = () => {
    setIsCreating(true);
  };

  return (
    <Center h="90vh">
      {/* <Container> */}
      <VStack>
        <Text>Créer un sondage</Text>
        {isCreating ? (
          <NewPoll />
        ) : (
          <>
            <PresentationCreation />
            <Button mt="10" onClick={handleOnCreation}>
              Créer un sondage
            </Button>
          </>
        )}
      </VStack>
    </Center>
  );
};

export default PollCreation;
