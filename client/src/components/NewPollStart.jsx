import React, { useState } from "react";
import {
  Progress,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  Text,
  FormHelperText,
  InputRightElement,
  VStack,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";

const NewPollStart = ({
  handlePollCreation,
  isProcessing,
  setIsProcessing,
}) => {
  const [pollName, setPollName] = useState("");
  const [description, setDescription] = useState("");
  const [quorum, setQuorum] = useState(0);

  //recupère toute les input et en fait un objet pour le parent
  const handleCreate = () => {
    // console.log("pollName", pollName);
    // console.log("description", description);
    // console.log("quorum", quorum);

    const name = document.getElementById("pollName").value;
    const description = document.getElementById("description").value;
    const quorum = document.getElementById("quorum").value;

    const poll = {
      name,
      description,
      quorum,
    };
    handlePollCreation(poll);
    setIsProcessing(true);
  };

  return (
    <VStack>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Création du sondage : étape 1
      </Heading>

      <FormControl mr="5%">
        <FormLabel htmlFor="pollName" fontWeight={"normal"}>
          Nom du sondage
        </FormLabel>
        <Input id="pollName" placeholder="nom" />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="description" fontWeight={"normal"}>
          description
        </FormLabel>
        <Input id="description" placeholder="votre description" />
      </FormControl>
      <FormControl mt="2%">
        <FormLabel htmlFor="quorum" fontWeight={"normal"}>
          Nombre de réponses désirées
        </FormLabel>
        <Input id="quorum" type="number" />
        <FormHelperText>
          Vous pourrez récupérer les fonds destinés aux répondants manquants.
        </FormHelperText>
      </FormControl>
      <Button
        h="1.75rem"
        size="md"
        isLoading={isProcessing}
        onClick={handleCreate}
      >
        Valider et créer le sondage !
      </Button>
      <Text mt="2%" fontSize="sm">
        * pour le paiement, le minimum est de 0.05eth + 0.0001eth/réponse
      </Text>
    </VStack>
  );
};

export default NewPollStart;
