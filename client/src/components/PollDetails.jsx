import React, { useState, useEffect } from "react";
import { useConnection } from "../contexts/ConnectionContext";
import { useContracts } from "../contexts/ContractsContext";
import { Box, Heading } from "@chakra-ui/react";

const PollDetails = ({ address }) => {
  const { wallet } = useConnection();
  const { contractsState } = useContracts();

  const [pollInfos, setPollInfos] = useState({ status: "" });

  const getInfos = async () => {
    console.log("getInfos", address);
    const pollInstance = new contractsState.web3.eth.Contract(
      contractsState.PollMasterAbi,
      address
    );
    console.log("getInfos", pollInstance);
    // const poll = await pollInstance.methods
    //   .getPollInformations()
    //   .call({ from: wallet.accounts[0] });
    // console.log("polls ADD CLONES", poll);
    const status = await pollInstance.methods
      .getPollStatus()
      .call({ from: wallet.accounts[0] });
    console.log("polls ADD CLONES", status);

    setPollInfos({ status: status });
  };

  useEffect(() => {
    console.log("First UE Details", address);
    getInfos();
  }, [address]);

  return (
    <>
      <Heading as={"h3"} size={"md"}>
        Nom: {pollInfos.infos} Status: {pollInfos.status}
      </Heading>
    </>
  );
};

export default PollDetails;
