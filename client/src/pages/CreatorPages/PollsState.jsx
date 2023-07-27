import React, { useState, useEffect, useContext } from "react";
import { Button, ButtonGroup, Select, VStack } from "@chakra-ui/react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";
import { Box, Heading, Flex, Container, Text } from "@chakra-ui/react";
import PollDetails from "../../components/PollDetails";
import Web3 from "web3";
import { statusToString } from "../../utils/helpers";
//affihcer list des clones creer par PollFactory => et reduire à ceux pour le quel add est owner
//pouvoir selectionner => declenche affichage du suivi
//là avoir stauts du sondage et bouton : soumettre à dao, ouvrir, close, recuperer les resultats
const PollsState = () => {
  const [pollList, setPollList] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollInfos, setPollInfos] = useState({ infos: null, status: null });

  const { initTx, subscribeEvent } = useContext(TxContext);
  const { wallet } = useConnection();
  const { contractsState } = useContracts();

  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchedAnswers, setFetchedAnswers] = useState([]);
  // const [isDisabled, setIsDisabled] = useState([true, true]);

  // const updateIsDisabled = (status) => {
  //   if (status == 0) {
  //     setIsDisabled([false, true]);
  //   }
  //   if (status == 1) {
  //     setIsDisabled([true, false]);
  //   } else {
  //     setIsDisabled([true, true]);
  //   }
  // };

  const getIsDisabled = (id) => {
    if (id === 0 && pollInfos.status == 0) {
      return false;
    }
    if (id === 1 && pollInfos.status == 4) {
      return false;
    }
    return true;
  };

  const getInfos = async (add) => {
    const instance = await new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi, //IPollAdminAbi,
      add
    );
    const infos = await instance.methods.getPollInformations().call();
    const status = await instance.methods.getPollStatus().call();
    console.log("infos", infos, "\n status", status);
    setPollInfos({ infos: infos[0], status: status });
    // updateIsDisabled(status);
  };

  //get the selected poll
  const selectChange = (e) => {
    console.log("selectChange", e.target.value);
    setSelectedPoll(e.target.value);

    getInfos(e.target.value);
  };

  //watcher on account0 to refresh the list and get only the poll for which account0 is owner
  useEffect(() => {
    const getPolls = async () => {
      const polls = await contractsState.PollFactoryInstance.methods
        .getPollClonesAddresses()
        .call({ from: wallet.accounts[0] });
      console.log("(PollState)/ UEff :polls ADD CLONES", polls);

      const pollOfAccount = [];
      for (let i = 0; i < polls.length; i++) {
        const instance = await new contractsState.web3.eth.Contract(
          contractsState.PollMasterAbi, //IPollAdminAbi,
          polls[i]
        );
        const pollOwner = await instance.methods
          .owner()
          .call({ from: wallet.accounts[0] })
          .then(function (res) {
            console.log(
              "AFFICHE MOI CA : pollOwner",
              res,
              "\n accounts0",
              wallet.accounts[0],
              "\n polls[i]",
              polls[i]
            );
            if (res.toUpperCase() === wallet.accounts[0].toUpperCase()) {
              console.log("PUSH de polls[i]", polls[i]);
              pollOfAccount.push(polls[i]);
            }
          });
      }
      console.log("pollOfAccount", pollOfAccount, "\n polls", polls);

      setPollList(pollOfAccount);
    };
    getPolls();
  }, [wallet.accounts]);

  //refactor => to have poll instance easily
  const updateSubmission = async (res) => {
    console.log(
      "updateSubmission via callback ",
      res,
      "caling\n",
      selectedPoll
    );
    const instance = await new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi, //IPollAdminAbi,
      selectedPoll
    );
    // const infos = await instance.methods.getPollInformations().call();
    const status = await instance.methods.getPollStatus().call();
    console.log(
      "Update status AFTER SUBMIT status",
      status,
      "\nselectedPoll",
      selectedPoll
    );
    setPollInfos((old) => ({ ...old, status: status }));
  };

  const handleSubmit = async () => {
    console.log("handleSubmit");
    const pollInstance = await new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi,
      selectedPoll
    );
    initTx(pollInstance, "submitPoll", [], wallet.accounts[0], 0, {
      callbackFunc: updateSubmission,
      callbackParam: true,
    });
  };

  const updateEndPoll = async (res) => {
    console.log("updateEndPoll via callback ", res);
    // const instance = await new contractsState.web3.eth.Contract(
    //   contractsState.PollMasterAbi, //IPollAdminAbi,
    //   selectedPoll
    // );
    // const getAnswers = async () => {
    //   try {
    //     const answers = await instance.methods
    //       .getPackedAnswers()
    //       .call({ from: wallet.accounts[0] });
    //     console.log("answers", answers);
    //     return answers;
    //   } catch (error) {
    //     console.error("ANSWERS FETCHING error : ", error);
    //   }
    // };
    // const answers = await getAnswers();
    // setFetchedAnswers(answers);
    setIsProcessing(false);
  };

  const hanldeStop = async () => {
    console.log("hanldeStop");
    const pollInstance = await new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi,
      selectedPoll
    );

    initTx(pollInstance, "endPoll", [], wallet.accounts[0], 0, {
      callbackFunc: updateEndPoll,
      callbackParam: true,
    });
    setIsProcessing(true);
  };

  return (
    <>
      <Box>
        <Heading as={"h1"} size={"xl"}>
          Vos sondages
        </Heading>
        <Select
          onChange={selectChange}
          placeholder="choisissez un de vos sondages"
        >
          {pollList.map((poll) => (
            <option value={poll} key={poll}>
              {poll}
            </option>
          ))}
        </Select>

        {selectedPoll && (
          <>
            <Heading mt="5" as={"h3"} size={"md"}>
              Sondage séléctionné: {selectedPoll}
            </Heading>
            {/* <PollDetails address={selectedPoll} /> */}
          </>
        )}
        {pollInfos.infos && (
          <Heading mt="5" as={"h3"} size={"md"}>
            Nom: {pollInfos.infos} {" / "}Status:{" "}
            {statusToString(pollInfos.status)}
          </Heading>
        )}
        <Container my="5">
          <ButtonGroup>
            <Button
              size="lg"
              isDisabled={getIsDisabled(0)}
              onClick={handleSubmit}
            >
              Submit to validation
            </Button>
            <Button
              size="lg"
              isDisabled={getIsDisabled(1)}
              isLoading={isProcessing}
              onClick={hanldeStop}
            >
              end the poll
            </Button>
          </ButtonGroup>
        </Container>
        <Container my="5">
          <VStack>
            {fetchedAnswers.length > 0 && (
              <>
                <Heading mt="5" as={"h3"} size={"md"}>
                  Resultats: {fetchedAnswers}
                </Heading>
                <Text style={{ fontStyle: "italic" }}>
                  les réponses nes ont pas décomprées, les bits à 1 sont
                  l'indice des réponses choisies
                </Text>
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export default PollsState;
