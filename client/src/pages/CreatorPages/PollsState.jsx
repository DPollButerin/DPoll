import React, { useState, useEffect, useContext } from "react";
import { Select } from "@chakra-ui/react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";
import { Box, Heading } from "@chakra-ui/react";
import PollDetails from "../../components/PollDetails";

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

  const selectChange = (e) => {
    console.log("selectChange", e.target.value);
    setSelectedPoll(e.target.value);

    // const pollInstance = new contractsState.web3.eth.Contract(
    //   contractsState.PollMasterAbi,
    //   e.target.value
    // );
    // const getInfos = async () => {
    //   const poll = await pollInstance.methods
    //     .getPollInformations(selectedPoll)
    //     .call({ from: wallet.accounts[0] });
    //   console.log("polls ADD CLONES", poll);
    //   const status = await pollInstance.methods
    //     .getPollStatus(selectedPoll)
    //     .call({ from: wallet.accounts[0] });
    //   console.log("polls ADD CLONES", status);
    //   setPollInfos({ infos: poll, status: status });
    // };
    // getInfos();
  };

  useEffect(() => {
    const getPolls = async () => {
      const polls = await contractsState.PollFactoryInstance.methods
        .getPollClonesAddresses()
        .call({ from: wallet.accounts[0] });
      console.log("(PollState)/ UEff :polls ADD CLONES", polls);
      setPollList(polls);
    };
    getPolls();
  }, []);

  // useEffect(() => {
  //   const getInfos = async () => {
  //     const poll = await contractsState.PollMasterInstance.methods
  //       .getPollInformations(selectedPoll)
  //       .call({ from: wallet.accounts[0] });
  //     console.log("polls ADD CLONES", poll);
  //     const status = await contractsState.PollMasterInstance.methods
  //       .getPollStatus(selectedPoll)
  //       .call({ from: wallet.accounts[0] });
  //     console.log("polls ADD CLONES", status);
  //     setPollInfos({ infos: poll, status: status });
  //   };
  //   getInfos();
  // }, [selectedPoll]);
  // <option value="sondage1">Sondage 1</option>;
  return (
    <>
      <Box>
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
            <Heading as={"h3"} size={"md"}>
              Sondage séléctionné: {selectedPoll}
            </Heading>
            <PollDetails address={selectedPoll} />
          </>
        )}
        {/* {pollInfos.infos && (
          <Heading as={"h3"} size={"md"}>
            Nom: {pollInfos.infos} Status: {pollInfos.status}
          </Heading>
        )} */}
      </Box>
    </>
  );
};

export default PollsState;
