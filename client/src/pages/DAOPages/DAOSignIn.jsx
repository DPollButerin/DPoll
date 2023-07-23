import React from "react";
import { Button, Center, Box, Text, VStack } from "@chakra-ui/react";
import { useContext } from "react";
import TxContext from "../../contexts/TxContext/TxContext";
import { useConnection } from "../../contexts/ConnectionContext";
import { useContracts } from "../../contexts/ContractsContext";

const DAOSignIn = ({ isMember, setIsMember }) => {
  const { initTx, subscribeEvent } = useContext(TxContext);
  const { wallet } = useConnection();
  const { contractsState } = useContracts();

  const updateIsMember = (isMember) => {
    setIsMember(isMember);
    console.log("updateIsMember via callback", isMember);
  };

  const handleSignIn = async () => {
    const entryFee = 0.02; //conv to wei
    const entryFeeWei = contractsState.web3.utils.toWei(
      entryFee.toString(),
      "ether"
    );
    // initTx(
    //   contractsState.DPollDAOInstance,
    //   "addMember",
    //   [wallet.accounts[0]],
    //   wallet.accounts[0],
    //   entryFeeWei,
    //   {
    //     callbackFunc: updateIsMember,
    //     callbackParam: true,
    //   }
    // );

    await contractsState.DPollDAOInstance.methods
      .addMember(wallet.accounts[0])
      .send({ from: wallet.accounts[0], value: entryFeeWei });
    // setIsMember(true);
    subscribeEvent(contractsState.DPollDAOInstance, "MemberAdded", true);
  };

  return (
    <Center h="90vh">
      {/* <Container> */}
      <VStack>
        <Text>Vous devrez verser 0.02eth à la DAO.</Text>{" "}
        <Text>Cette somme sera bloquée pendant 28 jours.</Text>
        <Text>Vous ne pourrez donc quittez la DAO avant 28 jours.</Text>
        {/* </Container> */}
        {!isMember ? (
          <Button mt="10" onClick={() => handleSignIn()}>
            Devenir membre
          </Button>
        ) : (
          <>
            <Text>Vous êtes déjà memnbre</Text>
            <Button mt="10">Quitter la DAO</Button>
          </>
        )}
      </VStack>
    </Center>
  );
};

export default DAOSignIn;
//{handleSignIn()}> bien 2 fois la tx
