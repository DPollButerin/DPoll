import { Button } from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import NewPollStart from "./NewPollStart";
import NewPollForm from "./NewPollForm";
import { Text } from "@chakra-ui/react";

import TxContext from "../contexts/TxContext/TxContext";
import { useConnection } from "../contexts/ConnectionContext";
import { useContracts } from "../contexts/ContractsContext";

const NewPoll = () => {
  const [poll, setPoll] = useState({});
  const [pollContent, setPollContent] = useState([]);
  const [step, setStep] = useState(0); //1 creation 2 3 add contenu 4 validation

  const { initTx, subscribeEvent } = useContext(TxContext);
  const { wallet } = useConnection();
  const { contractsState } = useContracts();

  const [getNewPoll, setGetNewPoll] = useState(false);
  const [newPollAddress, setNewPollAddress] = useState(null);

  //pas propre devrais prendre l'add au retour de function mais:
  //get de factory pour recuperer tableau de clone et set la derniere add push comme nexpool courant
  const updateNewPoll = async (getNewPoll) => {
    setGetNewPoll(getNewPoll);
    console.log("updateNewPoll via callback", getNewPoll);

    const clones = await contractsState.PollFactoryInstance.methods
      .getPollClonesAddresses()
      .call({ from: wallet.accounts[0] });
    const lastClone = clones[clones.length - 1];
    console.log("lastClone", lastClone);
    setNewPollAddress(lastClone);
  };

  const handleOnCreation = () => {
    setPoll(poll);
  };

  // ne doit pas depasser 4
  const incrementStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePollCreation = (poll) => {
    setPoll(poll);
    console.log("poll", poll);
    incrementStep();

    //appel web3 => DPollFactory pour creer poll

    const amount = 0.07;
    const amountTowei = contractsState.web3.utils.toWei(
      amount.toString(),
      "ether"
    );
    initTx(
      contractsState.PollFactoryInstance,
      "createPollContract",
      [poll.quorum, poll.name, poll.description, "eligibility"],
      wallet.accounts[0],
      amountTowei,
      {
        callbackFunc: updateNewPoll,
        callbackParam: true,
      }
    );
  };
  // const amount = 0.05 + 0.001 * poll.quorum;

  //   const handlePollContent = (pollContent) => {
  //     setPollContent(pollContent);
  //     console.log("pollContent", pollContent);
  //     incrementStep();
  //   };

  const handleAddTopic = (topic) => {
    console.log("pollContent AJOUT DE TOPIC PARENT", topic);

    setPollContent((old) => [...old, topic]);
    console.log("pollContent AJOUT DE TOPIC PARENT", pollContent);
    setStep(2); //step + 1);

    const amount = 0;
    const amountTowei = contractsState.web3.utils.toWei(
      amount.toString(),
      "ether"
    );
    let pollInstance = new contractsState.web3.eth.Contract(
      contractsState.IPollAdminAbi,
      newPollAddress
    );
    initTx(
      pollInstance,
      "addTopicsBatch",
      [topic.questions, topic.choices],
      wallet.accounts[0],
      amountTowei,
      {}
    );

    //METTRE LES EVENT DS INTERFACES!!!
    pollInstance = new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi,
      newPollAddress
    );
    subscribeEvent(pollInstance, "TopicsAdded", true);
  };

  useEffect(() => {
    console.log("WATCH POLL CHANGES poll", poll);
  }, [poll]);

  useEffect(() => {
    console.log("WATCH POLLCONTENT CHANGES pollContent", pollContent);
  }, [pollContent]);

  useEffect(() => {
    console.log("WATCH STEP CHANGES step", step);
  }, [step]);

  useEffect(() => {
    console.log("WATCH NEWPOLL CHANGES getNewPoll", newPollAddress);
  }, [newPollAddress]);

  //return 1 inpu question + 5 input answer + 1 bouton next question + 1 bouton valider
  return (
    <>
      {step === 0 ? (
        <NewPollStart handlePollCreation={handlePollCreation} />
      ) : step === 1 ? (
        <NewPollForm handleAddTopic={handleAddTopic} />
      ) : (
        //           : step === 2 ? (
        // <NewPollForm handleAddTopic={handleAddTopic} step={step} />
        //           )
        <Text>
          Vous avez créer le sondage et ajouter tout vos topic. Rendez vous dans
          suivi...
        </Text>
      )}
    </>
  );
};

export default NewPoll;
