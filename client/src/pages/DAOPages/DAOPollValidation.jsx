import React, { useState, useEffect, useContext } from "react";
import { Button, ButtonGroup, Select } from "@chakra-ui/react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";
import { Box, Heading, Flex, Container, HStack, Text } from "@chakra-ui/react";
import PollDetails from "../../components/PollDetails";
import Web3 from "web3";
import { statusToString } from "../../utils/helpers";

//will get add of account0
//will fetch poll listed in plugin validator
//will dispatch in 2 states: 1) sumitted (= to validate) 2) validated (finished)
//will display below a select with the first list
//-explication : select a poll to validate (we assume the validator check the content elsewhere )
//-when selected display the poll name and two button : 1) validate 2) refuse
//+ text : for the exam proccess shorten the last validator close the process and set the validation in poll contract
//when validated button are disbled
const DAOPollValidation = () => {
  const [validatedPolls, setValidatedPolls] = useState([]);
  const [toValidatePolls, setToValidatePolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollName, setPollName] = useState(null);
  const [voteCount, setVoteCount] = useState(null);
  const [voteFor, setVoteFor] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const { initTx, subscribeEvent } = useContext(TxContext);
  const { wallet } = useConnection();
  const { contractsState } = useContracts();

  const selectChangeValidated = (e) => {
    console.log("selectChangeValidated", e.target.value);
    // setSelectedPoll(e.target.value);
  };

  const selectChangeToValidate = (e) => {
    console.log("selectChangeToValidate", e.target.value);

    const getData = async () => {
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

        setPollName(pollInfos[0]);
        console.log("pollInfos[0]", pollInfos[0]);

        const validatorInstace = contractsState.DPollPluginValidatorInstance;
        const pollId = await validatorInstace.methods
          .pollSubmissionIds(e.target.value)
          .call({ from: wallet.accounts[0] });
        console.log("pollId", pollId);
        const submissionInfos = await validatorInstace.methods
          .pollSubmissions(pollId)
          .call({ from: wallet.accounts[0] });
        console.log("submissionInfos", submissionInfos);

        setVoteCount(submissionInfos.validatorsCount);
        console.log(
          "pollInfos.validators.length",
          submissionInfos.validatorsCount
        );

        setVoteFor(submissionInfos.voteCount);
        console.log("pollInfos.voteCount", submissionInfos.voteCount);
        setSelectedPoll(e.target.value);
      } catch (e) {
        console.log("(validator.jsx)/selectPoll ERROR", e);
      }
    };
    getData();
  };

  const updateVote = (isFor) => {
    console.log("updateVote", isFor);
    const getData = async () => {
      const web3 = contractsState.web3;
      const validatorAddress = contractsState.DPollPluginValidatorAddress;
      const pollInstace = new web3.eth.Contract(
        contractsState.PollMasterAbi,
        selectedPoll
      );
      if (web3 && validatorAddress) {
        try {
          const pollId = await validatorAddress.methods
            .pollSubmissionIds(selectedPoll)
            .call({ from: wallet.accounts[0] });
          console.log("pollId", pollId);
          const pollInfos = await validatorAddress.methods
            .pollSubmissions(pollId)
            .call({ from: wallet.accounts[0] });
          console.log("pollInfos", pollInfos);

          setVoteCount(pollInfos.validatorsCount);
          setVoteFor(pollInfos.voteCount);

          if (pollInfos.status != 0) {
            console.log("poll is validated");
            setValidatedPolls((validatedPolls) => [
              ...validatedPolls,
              selectedPoll,
            ]);
            setToValidatePolls((toValidatePolls) =>
              toValidatePolls.filter((poll) => poll != selectedPoll)
            );
            setIsDisabled(true);
          }
        } catch (e) {
          console.log("(validator.jsx)/update ERROR", e);
        }
      }
    };
    getData();
  };

  const handleValidation = async (isFor) => {
    console.log("handleValidation", selectedPoll);

    try {
      const web3 = contractsState.web3;
      const pollInstace = new web3.eth.Contract(
        contractsState.PollMasterAbi,
        selectedPoll
      );
      const validatorInstace = contractsState.DPollPluginValidatorInstance;

      const pollId = await validatorInstace.methods
        .pollSubmissionIds(selectedPoll)
        .call({ from: wallet.accounts[0] });
      console.log("pollId", pollId);

      initTx(
        validatorInstace,
        "voteForPoll",
        [parseInt(pollId), isFor],
        wallet.accounts[0],
        0,
        {
          callbackFunc: updateVote,
          callbackParam: isFor,
        }
      );
    } catch (e) {
      console.log("(validator.jsx)/voteFor ERROR", e);
    }
  };

  useEffect(() => {
    const getPolls = async () => {
      try {
        const web3 = contractsState.web3;
        const validatorAddress = contractsState.DPollPluginValidatorAddress;
        if (web3 && validatorAddress) {
          const polls =
            await contractsState.DPollPluginValidatorInstance.methods
              .getPolls()
              .call({ from: wallet.accounts[0] });
          console.log("polls submissions from validator plugin", polls);

          const donePolls = [];
          const toDoPolls = [];
          for (let i = 0; i < polls.length; i++) {
            const status = await polls[i].status;
            console.log(
              "polls submissions from validator plugin // status",
              status
            );

            if (status == 0) {
              toDoPolls.push(polls[i][0]); //index address or .address
            } else {
              donePolls.push(polls[i][0]);
            }
          }
          console.log("donePolls", donePolls);
          console.log("toDoPolls", toDoPolls);
          setValidatedPolls(donePolls);
          setToValidatePolls(toDoPolls);
        }
      } catch (e) {
        console.log("(Validator useffect ERROR", e);
      }
    };
    getPolls();
  }, [wallet.accounts]);

  return (
    <>
      <Box>
        <Heading as={"h1"} size={"xl"}>
          Sondages déjà validés :
        </Heading>
        <Select
          mt="5"
          onChange={selectChangeValidated}
          placeholder="choisissez un sondage"
        >
          {validatedPolls.map((poll) => (
            <option value={poll} key={poll}>
              {poll}
            </option>
          ))}
        </Select>
        <Heading as={"h1"} size={"xl"} mt="10">
          Sondages à valider :{" "}
          <span style={{ fontStyle: "italic", fontSize: "0.9rem" }}>
            il faut 2/3 de pour sur un total de 3 votes, le dernier déclenche la
            validation
          </span>
        </Heading>
        <Select
          mt="5"
          onChange={selectChangeToValidate}
          placeholder="choisissez un des sondages"
        >
          {toValidatePolls.map((poll) => (
            <option value={poll} key={poll}>
              {poll}
            </option>
          ))}
        </Select>
        {selectedPoll && (
          <HStack mt="10">
            <Heading mt="5" as={"h3"} size={"md"}>
              Sondage séléctionné: {selectedPoll}
            </Heading>
            {/* <PollDetails address={selectedPoll} /> */}
            <Text pl="10" mt="5" as={"h3"} size={"xl"}>
              Nom: {pollName}
            </Text>
            <Text pl="10" mt="5" as={"h3"} size={"xl"}>
              Votes: {voteCount}/3
            </Text>
            <Text pl="10" mt="5" as={"h3"} size={"xl"}>
              Nom: {voteFor}/2
            </Text>
            <ButtonGroup>
              <Button
                size="lg"
                isDisabled={isDisabled}
                onClick={() => handleValidation(true)}
              >
                valider
              </Button>
              <Button
                size="lg"
                isDisabled={isDisabled}
                onClick={() => handleValidation(false)}
              >
                refuser
              </Button>
            </ButtonGroup>
          </HStack>
        )}
        {/* {pollInfos.infos && (
          <Heading mt="5" as={"h3"} size={"md"}>
            Nom: {pollInfos.infos} {" / "}Status:{" "}
            {statusToString(pollInfos.status)}
          </Heading>
        )} */}
        {/* <Container my="5">
          <ButtonGroup>
            <Button
              size="lg"
              isDisabled={getIsDisabled(0)}
              onClick={handleSubmit}
            >
              Submit to validation
            </Button>
            <Button size="lg" isDisabled={getIsDisabled(1)}>
              end the poll
            </Button>
          </ButtonGroup>
        </Container> */}
      </Box>
    </>
  );
};

export default DAOPollValidation;
