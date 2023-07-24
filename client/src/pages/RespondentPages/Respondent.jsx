import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  Flex,
  Spacer,
  Heading,
  Header,
  IconButton,
} from "@chakra-ui/react";
import PresentationCard from "../../components/PresentationCard";

//todo : component for inside page => 3 vertically or 3 horizontally
const Respondent = () => {
  const objOutlet = useOutletContext();
  const m = objOutlet.hello;
  return (
    <VStack
      maxH={"100%"}
      maxW={"100%"}
      align={"center"}
      spacing={{ base: 20, md: 36 }}
    >
      <Heading
        as={"h1"}
        size={"4xl"}
        // h={"20%"}
        // style={{ justifyContent: "center" }}
        pt={10}
      >
        Espace Répondant
      </Heading>
      <Spacer />
      <Flex h={"80%"}>
        <PresentationCard
          direction="column"
          title="Vours répondez. Vous êtes rémunéré."
          description="En participant aux sondages proposés vous êtes récompensés
            directement en xxx.Votre wallet suffit
            Vérifiez dès maintenant les sondages auxquels vous êtes éligible et
            commencez à faire grandir votre cagnotte."
          buttonText="Répondre"
          h={"50vh"}
        />

        <PresentationCard
          direction="column"
          title="Votre anonymat est préservé. Aucune inscription n'est requise."
          description="La technologie blockchain nous permet d'assurer votre anonymat tout
            en garantissant une fiabilité des données aux créateurs de sondages.
          Aucun compte n'est requis. Votre wallet suffit.Vos données personnelles sont précieuses. Découvrez tout le
            processus."
          buttonText="Découvrir"
        />

        <PresentationCard
          direction="column"
          title="Mes récompenses."
          description="Vos réponses se sont transformées en récompenses!
            Ou c'est peut être bientôt le cas. Répondez à davantage de sondages
            pour faire grimper votre cagnotte.
         
            Solde: CONNECT WALLET"
          buttonText="Claim"
        />
      </Flex>
    </VStack>
  );
};

export default Respondent;
