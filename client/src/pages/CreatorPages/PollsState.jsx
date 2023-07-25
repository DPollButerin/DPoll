import React, { useState, useEffect, useContext } from "react";
import { Button, ButtonGroup, Select } from "@chakra-ui/react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";
import { Box, Heading, Flex, Container } from "@chakra-ui/react";
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
    if (id === 1 && pollInfos.status == 1) {
      return false;
    }
    return true;
  };

  // Fonction pour récupérer les derniers événements émis par le contrat
  async function getLatestPollStatusChange(add) {
    try {
      let contract = new contractsState.web3.eth.Contract(
        contractsState.PollMasterAbi, //IPollAdminAbi,
        add
      );

      contract
        .getPastEvents(
          "PollStatusChange",
          {
            fromBlock: 0,
            toBlock: "latest",
          },
          function (error, events) {
            console.log("POLLSTATUS CHANGE", events);
            console.log("POLLSTATUS CHANGE error", error);
          }
        )
        .then(function (events) {
          console.log(events);
        });

      contract
        .getPastEvents(
          "TopicsAdded",
          {
            fromBlock: 0,
            toBlock: "latest",
          },
          function (error, events) {
            console.log("TopicsAdded CHANGE", events);
            console.log("TopicsAdded CHANGE error", error);
          }
        )
        .then(function (events) {
          console.log(events);
        });
      // // Obtenez le dernier numéro de bloc
      // const latestBlockNumber = await contractsState.web3.eth.getBlockNumber();

      // // Définissez le filtre pour les événements que vous souhaitez récupérer
      // const eventFilter = contract.events.PollStatusChange({
      //   fromBlock: latestBlockNumber - 100, // Définissez une plage de blocs dans laquelle rechercher les événements (par exemple, les 100 derniers blocs)
      //   toBlock: latestBlockNumber,
      // });

      // // Obtenez les événements correspondant au filtre
      // const events = await eventFilter.getPastEvents("allEvents");

      // // Parcourez les événements pour obtenir le dernier événement PollStatusChange
      // let latestEvent = null;
      // for (let i = events.length - 1; i >= 0; i--) {
      //   if (events[i].event === "PollStatusChange") {
      //     latestEvent = events[i];
      //     break;
      //   }
      // }

      // // Vérifiez si un événement a été trouvé et obtenez la valeur de 'newStatus'
      // if (latestEvent) {
      //   const newStatusValue = latestEvent.returnValues.newStatus;
      //   console.log("Dernière valeur de 'newStatus': ", newStatusValue);
      // } else {
      //   console.log(
      //     "Aucun événement PollStatusChange trouvé dans les 100 derniers blocs."
      //   );
      // }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements : ", error);
    }
  }

  const getInfos = async (add) => {
    // console.log("getInfos called add", add);
    // // const pollInstance = await new contractsState.web3.eth.Contract(
    // //   contractsState.IPollViewAbi,
    // //   add
    // // );
    // // console.log("getInfos called pollInstance", pollInstance);
    // // const poll = pollInstance.methods
    // //   .getPollInformations()
    // //   .call({ from: wallet.accounts[0] })
    // //   .on("receipt", (receipt) => {
    // //     console.log("receipt in GETINFOS", receipt);
    // //   });
    // // console.log("polls ADD CLONES", poll);
    // // const status = await pollInstance.methods
    // //   .getPollStatus()
    // //   .call({ from: wallet.accounts[0] })
    // //   .on("receipt", (receipt) => {
    // //     console.log("receipt in GETINFOS", receipt);
    // //   });
    // // console.log("polls ADD CLONES", status);
    // // setPollInfos({ infos: poll, status: status });
    // // const testWeb3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    // // const pollInstance = await new testWeb3.eth.Contract(
    // //   // contractsState.IPollViewAbi,
    // //   contractsState.PollMasterAbi,

    // //   add
    // // );
    // // let pollInstance = new contractsState.web3.eth.Contract(
    // //   contractsState.PollMasterAbi, //IPollAdminAbi,
    // //   add
    // // );
    // // let pollContract = await new contractsState.web3.eth.Contract(
    // //   contractsState.PollMasterAbi
    // // );
    // // let pollInstance = await pollContract.at(add);
    // // console.log("getInfos called pollInstance", pollInstance);
    // // // const poll = pollInstance.methods
    // // //   .getPollInformations()
    // // //   .send({ from: wallet.accounts[0] })
    // // //   .on("receipt", (receipt) => {
    // // //     console.log("receipt in GETINFOS", receipt);
    // // //   });
    // // // console.log("polls ADD CLONES", poll);
    // // console.log("polls ADD CLONES", pollInstance);
    // // console.log("polls ADD CLONES", pollInstance.options);
    // getLatestPollStatusChange(add);
    // try {
    //   let pollInstance = new contractsState.web3.eth.Contract(
    //     contractsState.PollMasterAbi, //IPollAdminAbi,
    //     add
    //   );
    //   // let pollContract = await new contractsState.web3.eth.Contract(
    //   //   contractsState.PollMasterAbi
    //   // );
    //   // let pollInstance = await pollContract.at(add);
    //   // console.log("getInfos called pollInstance", pollInstance);
    //   // const poll = pollInstance.methods
    //   //   .getPollInformations()
    //   //   .send({ from: wallet.accounts[0] })
    //   //   .on("receipt", (receipt) => {
    //   //     console.log("receipt in GETINFOS", receipt);
    //   //   });
    //   // console.log("polls ADD CLONES", poll);
    //   console.log("polls ADD CLONES", pollInstance);
    //   console.log("polls ADD CLONES", pollInstance.options);
    //   console.log(
    //     "bytecodedployed",
    //     await contractsState.web3.eth.getCode(add)
    //   );
    //   const status = await pollInstance.methods
    //     .getPollStatusExt()
    //     .call({ from: wallet.accounts[0] })
    //     .then(function (res) {
    //       console.log("AFFICHE MOI CA", res);
    //     })
    //     .catch((error) => console.log("error", error));

    //   // {
    //   //   from: wallet.accounts[0],
    //   //   gasPrice: "30000000000",
    //   //   gas: "1000000",
    //   // });
    //   // .then((res) => console.log("ICICICICIC", res));
    //   //   "receipt", (receipt) => {
    //   //   console.log("receipt in GETINFOS", receipt);
    //   // });
    //   console.log("polls ADD CLONES satatu!!!!!!!!!", status);

    //   ///TEST
    //   const topics = await pollInstance.methods
    //     .getTopics()
    //     .call({ from: wallet.accounts[0] })
    //     .then(function (res) {
    //       console.log("AFFICHE MOI CA topics dans thennnnnnnnnnnnnnnn", res);
    //     });
    //   console.log("LES TOPICCSSSSS polls ADD CLONES topics", topics);

    //   setPollInfos({ infos: "infos", status: status });
    // } catch (err) {
    //   console.log("polls ADD CLONES", err);
    // }
    const instance = await new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi, //IPollAdminAbi,
      add
    );
    const infos = await instance.methods.getPollInformations().call();
    const status = await instance.methods.getPollStatus().call();
    console.log("infos", infos, "\n status", status);
    setPollInfos({ infos: infos[0], status: status });
    updateIsDisabled(status);
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
            <Button size="lg" isDisabled={getIsDisabled(0)}>
              Submit to validation
            </Button>
            <Button size="lg" isDisabled={getIsDisabled(1)}>
              end the poll
            </Button>
          </ButtonGroup>
        </Container>
      </Box>
    </>
  );
};

export default PollsState;
