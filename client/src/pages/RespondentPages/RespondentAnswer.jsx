import React, { useEffect, useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Select,
  Text,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Center,
} from "@chakra-ui/react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";
import PollDetails from "../../components/PollDetails";
import Web3 from "web3";
import { statusToString } from "../../utils/helpers";

const RespondentAnswer = () => {
  // const objOutlet = useOutletContext(); //virer
  const { initTx, subscribeEvent } = useContext(TxContext);
  const { wallet } = useConnection();
  const { contractsState } = useContracts();
  const [pollsToVote, setPollsToVote] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [topics, setTopics] = useState([]);
  const [infos, setInfos] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectChangePoll = (e) => {
    console.log("selectChangePoll", e.target.value);

    const getTopics = async () => {
      try {
        const web3 = contractsState.web3;
        const pollInstace = new web3.eth.Contract(
          contractsState.PollMasterAbi,
          e.target.value
        );
        const pollInfos = await pollInstace.methods
          .getPollInformations()
          .call({ from: wallet.accounts[0] });
        console.log("pollInfos", pollInfos);

        const topicCount = await pollInstace.methods
          .getTopicsLength()
          .call({ from: wallet.accounts[0] });
        console.log("topicCount", topicCount);

        const topics = [];
        for (let i = 0; i < topicCount; i++) {
          const topic = await pollInstace.methods
            .getTopic(i)
            .call({ from: wallet.accounts[0] });
          console.log("topic", topic);
          topics.push(topic);
        }
        console.log("topics ICIICICICI !!! :", topics);

        setInfos(pollInfos);

        setSelectedPoll(e.target.value);
        setTopics(topics);
      } catch (e) {
        console.log("getTopics on select ANSWERRESPONDAENT ERROR", e);
      }
    };
    getTopics();
  };

  const updateAnswered = (isAnswered) => {
    console.log("updateAnswered via callback", isAnswered);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    console.log("handleSubmit");
    //get inputs
    const answer1 = document.getElementById("answer1").value;
    const answer2 = document.getElementById("answer2").value;
    console.log("answer1", answer1);
    console.log("answer2", answer2);
    const answers = [answer1, answer2];
    let eligibilityProof = "i m certainly eligible";

    const web3 = contractsState.web3;
    eligibilityProof = web3.utils.asciiToHex(eligibilityProof); //convert to bytes32
    const pollInstance = new web3.eth.Contract(
      contractsState.PollMasterAbi,
      selectedPoll
    );

    initTx(
      pollInstance,
      "addAnswer",
      [answers, eligibilityProof],
      wallet.accounts[0],
      0,
      {
        callbackFunc: updateAnswered,
        callbackParam: true,
      }
    );
    setIsProcessing(true);
  };

  useEffect(() => {
    console.log("USEFFECT RESPONDETANSWER");

    const web3 = contractsState.web3;
    const factoryInstance = contractsState.PollFactoryInstance;
    const availablePolls = [];
    const getData = async () => {
      if (web3 && factoryInstance) {
        try {
          const polls = await factoryInstance.methods
            .getPollClonesAddresses()
            .call({ from: wallet.accounts[0] });
          console.log("polls", polls);

          for (let i = 0; i < polls.length; i++) {
            const pollInstace = new web3.eth.Contract(
              contractsState.PollMasterAbi,
              polls[i]
            );
            const pollInfos = await pollInstace.methods
              .getPollInformations()
              .call({ from: wallet.accounts[0] });
            console.log("pollInfos", pollInfos);
            const pollStatus = await pollInstace.methods
              .getPollStatus()
              .call({ from: wallet.accounts[0] });
            console.log("pollStatus", pollStatus);

            if (pollStatus == 4) {
              availablePolls.push(polls[i]);
            }
          }
          console.log("availablePolls", availablePolls);
          setPollsToVote(availablePolls);
        } catch (e) {
          console.log("useeffect ANSWERRESPONDAENT ERROR", e);
        }
      }
    };
    getData();
  }, [wallet.accounts[0]]);

  ///attnetion => check les taille de tableau REFACTOR => extraire les data
  //idem pour les appels web3 trop de rédite les contextes servent à rien là
  return (
    <>
      <Box>
        <Heading as={"h1"} size={"xl"}>
          Sondages displonibles :
        </Heading>
        <Select
          mt="5"
          onChange={selectChangePoll}
          placeholder="choisissez un sondage"
        >
          {pollsToVote.map((poll) => (
            <option value={poll} key={poll}>
              {poll}
            </option>
          ))}
        </Select>
        <Box mt="20">
          <HStack>
            <Text>Titre : {infos ? infos[0] : null} </Text>
            <Text>Description : {infos ? infos[1] : null}</Text>
          </HStack>
        </Box>
        <Box mt="5">
          <Flex>
            <Box
              style={{
                width: "40vw",
                height: "20vh",
                border: "1px solid gray",
              }}
            >
              {topics.length > 0 ? (
                <VStack>
                  <Text>QUESTION 1: {topics[0][1]}</Text>
                  <Text>REPONSE 0 : {topics[0][2][0]}</Text>
                  <Text>REPONSE 1 : {topics[0][2][1]}</Text>
                </VStack>
              ) : null}
            </Box>
            <Container>
              <FormControl>
                <FormLabel htmlFor="answer1" fontWeight={"normal"}></FormLabel>
                <Input
                  id="answer1"
                  placeholder="index de votre choix"
                  type="number"
                />
              </FormControl>
            </Container>
          </Flex>
        </Box>
        <Box mt="5">
          <Flex>
            <Box
              style={{
                width: "40vw",
                height: "20vh",
                border: "1px solid gray",
              }}
            >
              {topics.length > 1 ? (
                <VStack>
                  <Text>QUESTION 2: {topics[1][0]}</Text>
                  <Text>REPONSE 2 : {topics[1][2][0]}</Text>
                  <Text>REPONSE 3 : {topics[1][2][1]}</Text>
                </VStack>
              ) : null}
            </Box>
            <Container>
              <FormControl>
                <FormLabel htmlFor="answer2" fontWeight={"normal"}></FormLabel>
                <Input
                  id="answer2"
                  placeholder="index de votre choix"
                  type="number"
                />
              </FormControl>
            </Container>
          </Flex>
        </Box>
        <Center mt="10" style={{ height: "20hv" }}>
          <Button
            h="1.75rem"
            size="lg"
            isLoading={isProcessing}
            onClick={handleSubmit}
          >
            Send your answers
          </Button>
        </Center>
      </Box>
    </>
  );
};

export default RespondentAnswer;
