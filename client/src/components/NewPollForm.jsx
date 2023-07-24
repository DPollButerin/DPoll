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

//tranfo en page de topic a defiler
const NewPollForm = ({ handleAddTopic }) => {
  const [pollName, setPollName] = useState("");
  const [description, setDescription] = useState("");
  const [quorum, setQuorum] = useState(0);

  const handleCreate = () => {
    // console.log("pollName", pollName);
    // console.log("description", description);
    // console.log("quorum", quorum);
    console.log("handleAddTopic AJOUT DE TOPIC");
    // const name = document.getElementById("pollName").value;
    // const description = document.getElementById("description").value;
    // const quorum = document.getElementById("quorum").value;

    const poll = {
      questions: [
        document.getElementById("question").value,
        document.getElementById("question2").value,
      ],
      choices: [
        [
          document.getElementById("choice1").value,
          document.getElementById("choice2").value,
        ],
        [
          document.getElementById("choice3").value,
          document.getElementById("choice4").value,
        ],
      ],
    };
    handleAddTopic(poll);
  };

  return (
    <VStack>
      <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
        Remplissage du sondage : étape 2
      </Heading>

      <FormControl mr="5%">
        <FormLabel htmlFor="question" fontWeight={"normal"}>
          Question :
        </FormLabel>
        <Input id="question" placeholder="nom" />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="choice1" fontWeight={"normal"}>
          Choix 1 :
        </FormLabel>
        <Input id="choice1" placeholder="réponse" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="choice2" fontWeight={"normal"}>
          Choix 2 :
        </FormLabel>
        <Input id="choice2" placeholder="réponse" />
      </FormControl>
      <FormControl mr="5%">
        <FormLabel htmlFor="question2" fontWeight={"normal"}>
          Question2 :
        </FormLabel>
        <Input id="question2" placeholder="question" />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="choice3" fontWeight={"normal"}>
          Choix 1 :
        </FormLabel>
        <Input id="choice3" placeholder="réponse" />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="choice4" fontWeight={"normal"}>
          Choix 2 :
        </FormLabel>
        <Input id="choice4" placeholder="réponse" />
      </FormControl>
      <Button h="1.75rem" size="sm" onClick={handleCreate}>
        Ajouter le topic {}
      </Button>
      <Text mt="2%" fontSize="sm">
        * pour le paiement, le minimum est de 0.05eth + 0.0001eth/réponse
      </Text>
    </VStack>
  );
};

export default NewPollForm;
