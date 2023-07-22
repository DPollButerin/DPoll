import React from "react";
import { VStack, Heading, Text, Flex, Spacer } from "@chakra-ui/react";
import PresentationCard from "../../components/PresentationCard";

const Creator = () => {
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
        Espace créateur
      </Heading>
      <Text>
        Il est temps de trouver les réponses aux questions que vous vous posez.
        ... Facilement, rapidement et à un coût attractif.
      </Text>
      <Spacer />
      <Flex h={"80%"}>
        <PresentationCard
          direction="column"
          title="Créez un nouveau sondage."
          description="Qui que vous soyez. Professionnel, particulier ou collectif. Créez votre sondage, soumetez le à notre collectif de gouvernance, et c'est parti! Quelques bonnes pratoques sont à respecter si vous souhaitez être assuré que votre sondage arrive à terme! Consultez notre charte avant de vous lancer."
          buttonText="Créer"
          h={"50vh"}
        />

        <PresentationCard
          direction="column"
          title="Suivre l'avancement de mon sondage."
          description="Si bous avez soumis un sondage à notre collectif de gouvernance, c'est le moment de voir s'il a été accepté. Et si c'est le cas, découvrez combien de répondants ont répondu à votre appel ou récupérez vos réponses, si votre sondage est arrivé à son terme bien sûre."
          buttonText="Suivre"
        />

        <PresentationCard
          direction="column"
          title="Les bonnes pratiques"
          description="Votre sondage, avant d'être publié, passe à l'étape de la validation face à notre collectif de gouvernanace. Cela permet de limiter les dérives. Pour vous aider à maximiser vos chances de voir votre sondage validé par la gouvrenrnance, nous vous proposons un certain nombre de bonnes pratiques."
          buttonText="Découvrir"
        />
      </Flex>
    </VStack>
  );
};

export default Creator;
