import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { VStack, Heading, Text, Flex, Spacer } from "@chakra-ui/react";
import PresentationCard from "../../components/PresentationCard";
import { useContracts } from "../../contexts/ContractsContext";
import { useConnection } from "../../contexts/ConnectionContext";

//TOUT VIRER ICI QUE TEXTE DE PRESENTATION
const DAO = () => {
  const obj = "UNEMSG DE DAO MAIN"; //useOutletContext();
  const bal = <span>message : {obj}</span>;
  const { wallet } = useConnection();
  console.log("wallet", wallet);
  const account = wallet ? wallet.accounts[0] : null;
  console.log("account", account);
  const { contractsState } = useContracts();
  const [isMember, setIsMember] = useState(false);

  // const getIsMember = async () => {
  //   try{
  //     const web3 = contractsState.web3;
  //     const DAOaddress = contractsState.DPollDAOAddress;
  //     if (web3 && DAOaddress) {
  //       const IDAOInstance = contractsState.web3.eth.Contract(contractsState.IDAOmembershipAbi, DAOaddress);
  //       const isDAOMember = await IDAOInstance.methods.isMember(account).call({from: wallet.accounts[0]});
  //       console.log("(DAO.jsx)/isMember IN IF", isMember);
  //       setIsMember(isDAOMember);
  //     }
  //   }
  //   catch (e) {
  //     console.log("(DAO.jsx)/isMember ERROR", e);
  //   }
  // };

  useEffect(() => {
    console.log(
      "DAO useEffect WATCHING contractsState CHANGES",
      contractsState
    );
  }, [contractsState]);

  useEffect(() => {
    console.log("DAO useEffect WATCHING account CHANGES", account);
  }, [account]);

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
        Espace gouvernance
      </Heading>
      <Spacer />
      <Flex h={"80%"}>
        <PresentationCard
          direction="column"
          title="Validez des sondages."
          description="Véritable modérateur des sondages qui sont proposés, en tant que membre du collectif de gouvernace, votre ôle est de vous assurer que les sondages soumis à votre validation respectent bien les bonnes pratiques. Votre temps est précieux. Et c'est pourquoi vous êtes rémunérés de manière automatique pour cetta tâche."
          buttonText=""
          h={"50vh"}
        />

        <PresentationCard
          direction="column"
          title="Votre gouvernance."
          description="Y a t-il un pilote dans l'avion ? Participez activement en tant que membre de la gouvernance aux grandes décisions d'évolution de D-Pol et soyez ainsi acteur de son futur et de son développement. Un espace de discussion complet est à disposition pour ces échanges et ses débats qui promettent d'être passionnants!"
          buttonText=""
        />

        <PresentationCard
          direction="column"
          title="Devenir membre."
          description="Envie de devenir validateur de sondage ou envie d'avoir votre mot à dire sur l'avenir de D-Poll et son développement ? Montez à bord! Pour cela, rien de plus simple. Bloquez 25 Matic dans le protocole pendant une période minimum de 28 jours. Une fois cette période passée, vous pourrez les débloquer si vous le désirez."
          buttonText=""
        />
      </Flex>
    </VStack>
  );
};

export default DAO;
