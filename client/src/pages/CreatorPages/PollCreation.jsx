import React from "react";
import { Center, VStack, Button, Container, Text } from "@chakra-ui/react";

const PollCreation = () => {
  return (
    <Center h="90vh">
      {/* <Container> */}
      <VStack>
        <Container>
          <Text>
            1. vous devrez créer votre sondage, en payant les frais nécéssaires.
          </Text>{" "}
          <Text>
            2. vous devrez soumettre à la DAO votre sondage pour veiller au
            respect des bonnes pratiques. Cela nécessite l'acceptation d'au
            moins 2 sur 3 validateurs
          </Text>
          <Text>
            3. vous pourrez ensuite ouvrir votre sondage aux quelles des
            personnes éligibles répondront.
          </Text>
          <Text>
            3. il faudra ensuite clore le sondage puis récupérer les réponses.
          </Text>
          <Text>
            * pour le paiement, le minimum est de 0.05eth + 0.0001eth/réponse
            souhaitée. Augmentez le montant pour inciter les gens à répondre.
          </Text>
          <Text>
            * 10% va à la DAO, 10% aux validateurs, 80% aux répondants. La part
            des validateurs est due. La part de la DAO vous est retournée si le
            sondage n'est pas validé. Si le nombre de réponses n'est pas
            atteint, vous pourrez récupérer les fonds restant.
          </Text>
        </Container>
        <Button mt="10">Créer un sondage</Button>
      </VStack>
    </Center>
  );
};

export default PollCreation;
