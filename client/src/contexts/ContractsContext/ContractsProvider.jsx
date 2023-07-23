import React, { useReducer, useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import ContractsContext from "./ContractsContext";
import { reducer, actions, initialState } from "./contractsState";
import useConnection from "../ConnectionContext/useConnection";

/**
 * @dev : install @metamask/detect-provider => npm install @metamask/detect-provider
 * @notice : Provider to manage the vote contract and deployed addresses
 * @dev : a first loading will init data with abi, default deployed add and instance of the contracts
 * @param { any } children
 * @return : children wrapped by ContractsContext.Provider
 * @todo : ADD ERR CHECKS AND MANAGEMENT (needed for all providers)
 * @todo : MAKE IT MORE GENERIC and detach infos
 * @todo : IF DISCONNECTED => RESET contracts (interfaces part)=> as states (membership and caller... could change) / OnLY KEEP mains (dao, factory, master)
 */
function ContractsProvider({ children }) {
  const { wallet } = useConnection();

  const [contractsState, dispatch] = useReducer(reducer, initialState);

  const account = wallet.accounts[0];
  const [initiated, setInitiated] = useState(false);

  // /**
  //  * @dev : create a new vote contract add it to the voteState, and set the current contract to the new one
  //  * @params : none
  //  * @todo : CHANGE send params, ADD CHECKS
  //  * @todo : MOVE TO TXCONTEXT !!!
  //  */
  // const createVote = async () => {
  //   const { abi, bytecode } = voteState;
  //   const newContract = new voteState.web3.eth.Contract(abi);
  //   const newContractInstance = await newContract
  //     .deploy({
  //       data: bytecode,
  //       arguments: [],
  //     })
  //     .send({
  //       from: wallet.accounts[0],
  //       gas: 3000000, //1500000
  //       gasPrice: "30000000000",
  //     });
  //   const address = newContractInstance.options.address;

  //   dispatch({
  //     type: actions.addNewVote,
  //     data: {
  //       contractAddress: address,
  //       contract: newContractInstance,
  //       // isVoter, //A RETIRER => TEST SEuLEMENT
  //     },
  //   });

  //   console.log("(VoteProvider)/new vote deployed, address : ", address);
  // };

  // /**
  //  * @dev : get infos from the contract regarding the current user
  //  * @dev : return values are null if there's a pb during the call
  //  * @param { object } contract
  //  * @return : { isAdmin, isVoter, workflowIndex }
  //  */
  // const getContractInfos = async (contract) => {
  //   /*at the moment : null/ture/false, if null pb when fetching the info*/
  //   let isAdmin, isVoter, workflowIndex;
  //   await contract.methods
  //     .owner()
  //     .call({ from: wallet.accounts[0] })
  //     .then((result) => {
  //       isAdmin = result.toLowerCase() === wallet.accounts[0];
  //     });
  //   try {
  //     const result = await contract.methods
  //       .getVoter(wallet.accounts[0])
  //       .call({ from: wallet.accounts[0] });
  //     isVoter = result.isRegistered;
  //   } catch (err) {
  //     console.log(
  //       "(VoteProvider)/getInfos : voter : reverted => not registered"
  //     ); // console.err("(VoteProvider)/getInfos : voter",err);
  //   }
  //   await contract
  //     .getPastEvents("WorkflowStatusChange", {
  //       fromBlock: 0,
  //       toBlock: "latest",
  //     })
  //     .then(function (events) {
  //       workflowIndex = 0;
  //       if (events.length > 0) {
  //         const lastEvent = events[events.length - 1];
  //         workflowIndex = lastEvent.returnValues.newStatus;
  //       }
  //     });

  //   return { isAdmin, isVoter, workflowIndex };
  // };

  // const updateContractInfos = async (contract) => {
  //   const infos = await getContractInfos(contract);
  //   dispatch({
  //     type: actions.updateVote,
  //     data: {
  //       isAdmin: infos.isAdmin,
  //       isVoter: infos.isVoter,
  //       workflowIndex: infos.workflowIndex,
  //     },
  //   });
  // };

  // /**
  //  * @notice : ALWAYS NEED TO CONNECT TO A VOTE CONTRACT BEFORE DOING ANYTHING
  //  * @dev : connect to an existing vote contract and set the current contract to the new one
  //  * @param { string } addressToConnect
  //  *
  //  * @todo : TEST with testnet ??> also first add in network since migrate
  //  */
  // const connectToVote = async (addressToConnect) => {
  //   if (addressToConnect) {
  //     const { abi, web3 } = voteState;
  //     let contract, isAdmin, isVoter, workflowIndex;

  //     try {
  //       contract = new web3.eth.Contract(abi, addressToConnect);

  //       const infos = await getContractInfos(contract);
  //       isAdmin = infos.isAdmin;
  //       isVoter = infos.isVoter;
  //       workflowIndex = infos.workflowIndex;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //     console.log(
  //       "(VoteProvider)/ConnectToVot infos loaded : c,a,v,w:",
  //       contract,
  //       isAdmin,
  //       isVoter,
  //       workflowIndex
  //     );
  //     dispatch({
  //       type: actions.loadVote,
  //       data: {
  //         contract,
  //         isAdmin,
  //         isVoter,
  //         workflowIndex,
  //       },
  //     });
  //   }
  // };

  /**
   * @dev : init the contractsState with the artifact and set the current contract to the first deployed one
   * @dev artifacts array of {contractName, artifact}
   * @param { object } artifact
   */
  const init = useCallback(async (artifacts) => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    // const accounts = wallet.accounts[0];
    const networkID = await web3.eth.net.getId();
    console.log("networkID", networkID);

    let contracts = {};

    //DPollToken add undefined as deployed by DAO => if needed get it via DAO getDPTtokenAddress
    //Interfaces : no add as not deployed
    for (let i = 0; i < artifacts.length; i++) {
      let artifact = artifacts[i].artifact;
      let contractName = artifacts[i].contractName;
      if (artifact) {
        const { abi } = artifact;
        let address, contract;

        try {
          address = artifact?.networks[networkID]?.address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }
        contracts[contractName] = {
          abi: abi,
          instance: contract,
          address: address,
        };
      }
    }

    // if (artifact) {
    //   // const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    //   // // const accounts = wallet.accounts[0];
    //   // const networkID = await web3.eth.net.getId();
    //   // console.log("networkID", networkID);
    //   const { abi, bytecode } = artifact;
    //   let address, contract;

    //   //@todo : truffle ok / TEST with testnet ??> also first add in network since migrate
    //   try {
    //     address = artifact?.networks[networkID]?.address;
    //     contract = new web3.eth.Contract(abi, address);
    //   } catch (err) {
    //     console.error(err);
    //   }
    console.log("(ContractsProvider)/ GOING TO LOAD contracts : ", contracts);
    dispatch({
      type: actions.init,
      data: {
        web3: web3,
        networkID: networkID,
        CertifierAbi: contracts.Certifier.abi,
        CertifierInstance: contracts.Certifier.instance,
        CertifierAddress: contracts.Certifier.address,
        DPollDAOAbi: contracts.DPollDAO.abi,
        DPollDAOInstance: contracts.DPollDAO.instance,
        DPollDAOAddress: contracts.DPollDAO.address,
        PollFactoryAbi: contracts.PollFactory.abi,
        PollFactoryInstance: contracts.PollFactory.instance,
        PollFactoryAddress: contracts.PollFactory.address,
        PollMasterAbi: contracts.PollMaster.abi,
        PollMasterInstance: contracts.PollMaster.instance,
        PollMasterAddress: contracts.PollMaster.address,
        DPollTokenAbi: contracts.DPollToken.abi,
        DPollTokenInstance: contracts.DPollToken.instance,
        DPollTokenAddress: contracts.DPollToken.address,
        IDAOmembershipAbi: contracts.IDAOmembership.abi,
        IDAOmembershipInstance: contracts.IDAOmembership.instance,
        IDAOmembershipAddress: contracts.IDAOmembership.address,
        IPollAdminAbi: contracts.IPollAdmin.abi,
        IPollAdminInstance: contracts.IPollAdmin.instance,
        IPollAdminAddress: contracts.IPollAdmin.address,
        // contracts: {
        //   Certifier: {
        //     abi: contracts.Certifier.abi,
        //     instance: contracts.Certifier.instance,
        //     address: contracts.Certifier.address, //deployedAddress
        //   },
        //   DPollDAO: {
        //     abi: contracts.DPollDAO.abi,
        //     instance: contracts.DPollDAO.instance,
        //     address: contracts.DPollDAO.address,
        //   },
        //   PollFactory: {
        //     abi: contracts.PollFactory.abi,
        //     instance: contracts.PollFactory.instance,
        //     address: contracts.PollFactory.address,
        //   },
        //   PollMaster: {
        //     abi: contracts.PollMaster.abi,
        //     instance: contracts.PollMaster.instance,
        //     address: contracts.PollMaster.address,
        //   },
        //   DPollToken: {
        //     abi: contracts.DPollToken.abi,
        //     instance: contracts.DPollToken.instance,
        //     address: contracts.DPollToken.address,
        //   },
        //   IDAOPollmembership: {
        //     abi: contracts.IDAOPollmembership.abi,
        //     instance: contracts.IDAOPollmembership.instance,
        //     address: contracts.IDAOPollmembership.address,
        //   },
        // },
        //other infos ?
        account: {
          isAdmin: false,
          isMember: false,
        },
      },
    });
    console.log("(ContractsProvider)/ init contractsState : ", contracts);
  }, []);

  /**
   * @dev : init the contractsState with the artifact
   * @notice : it's run only once at the first render
   */
  useEffect(() => {
    const tryInit = async () => {
      try {
        const Certifier = require("../../contracts/Certifier.json"); //SimpleStorage.json");
        const DPollDAO = require("../../contracts/DPollDAO.json");
        const PollFactory = require("../../contracts/PollFactory.json");
        const PollMaster = require("../../contracts/PollMaster.json");
        const DPollToken = require("../../contracts/DPollToken.json");
        const IDAOmembership = require("../../contracts/IDAOmembership.json");
        const IPollAdmin = require("../../contracts/IPollAdmin.json");
        const artifacts = [
          { contractName: "Certifier", artifact: Certifier },
          { contractName: "DPollDAO", artifact: DPollDAO },
          { contractName: "PollFactory", artifact: PollFactory },
          { contractName: "PollMaster", artifact: PollMaster },
          { contractName: "DPollToken", artifact: DPollToken },
          { contractName: "IDAOmembership", artifact: IDAOmembership },
          { contractName: "IPollAdmin", artifact: IPollAdmin },
        ];
        init(artifacts);
      } catch (err) {
        console.error(err);
      }
    };
    if (!initiated) {
      // && account) {
      tryInit();
      setInitiated(true);
      console.log("(ContractsProvider)/useEffect LOADING ABIs", contractsState);
    }
    console.log("(ContractsProvider)/useEffect  watching refresh of context ");
  }); //[init]);

  // useEffect(() => {
  //   console.log(
  //     "(ContractsProvider)/ useEffect watching refresh of context : ",
  //     initiated
  //   );
  // });
  useEffect(() => {
    console.log(
      "(ContractsProvider)/ useEffect watching FIRST LOADING changes : ",
      initiated,
      contractsState
    );
  }, [initiated]);

  useEffect(() => {
    console.log(
      "(ContractsProvider)/ useEffect watching ACCOUNT 0 changes : ",
      account
    );
  }, [account]);
  /**
   * @dev : watcher on voteState changes
   * @todo : TO REMOVE AT THE END
   */
  useEffect(() => {
    console.log(
      "(ContractsProvier)/ useEffect watching contractsState changes : ",
      contractsState.web3
    );
  }, [contractsState]);

  return (
    <ContractsContext.Provider
      value={{
        // createVote,
        // connectToVote,
        // updateContractInfos,
        contractsState,
        dispatch,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}

export default ContractsProvider;
