/*
@name: contractsState.js
@description: state management of the contracts context
@updated : 
*/

/*
@notice : action types to manipulate the state of the contracts context
@todo : rename and refactor
*/
const actions = {
  init: "INIT",
  // resetCurrentVote: "RESET",
  // addNewVote: "ADD_VOTE",
  // loadVote: "LOAD_VOTE",
  // updateVote: "UPDATE_VOTE",
};

//contract used at the moment
//Certifier, DPollDAO, PollFactory, PollMaster, DPollToken
//interfaces IDAOPollmembarship
//need to make avaible their abi and instance
//ABI => BE SURE OF THE NEED TO KEEP IT when we get the instance cause its heavy (normally only PollMaster and interfaces are needed for clones)
//REFACTOR pb with ABI in reducer causing update to fail (? nested object update pb ?) for : Contracts:{Certifier:{abi: null, instance: null, address: null}...}
/*
@notice : initial state of the vote context 
*/
const initialState = {
  web3: null,
  networkID: null,
  CertifierAbi: null,
  CertifierInstance: null,
  CertifierAddress: null,
  DPollDAOAbi: null,
  DPollDAOInstance: null,
  DPollDAOAddress: null,
  PollFactoryAbi: null,
  PollFactoryInstance: null,
  PollFactoryAddress: null,
  PollMasterAbi: null,
  PollMasterInstance: null,
  PollMasterAddress: null,
  DPollTokenAbi: null,
  DPollTokenInstance: null,
  DPollTokenAddress: null,
  IDAOmembershipAbi: null,
  IDAOmembershipInstance: null,
  IDAOmembershipAddress: null,
  IPollAdminAbi: null,
  IPollAdminInstance: null,
  IPollAdminAddress: null,

  // contracts: {
  //   Certifier: {
  //     abi: null,
  //     instance: null,
  //     address: null, //deployedAddress
  //   },
  //   DPollDAO: {
  //     abi: null,
  //     instance: null,
  //     address: null,
  //   },
  //   PollFactory: {
  //     abi: null,
  //     instance: null,
  //     address: null,
  //   },
  //   PollMaster: {
  //     abi: null,
  //     instance: null,
  //     address: null,
  //   },
  //   DPollToken: {
  //     abi: null,
  //     instance: null,
  //     address: null,
  //   },
  //   IDAOmembership: {
  //     abi: null,
  //     instance: null,
  //     address: null,
  //   },
  // },
  // //other infos ?
  account: {
    isAdmin: false,
    isMember: false,
  },
};

//   abi: null,
//   bytecode: null,
//   web3: null,
//   deployedAddresses: [],
//   contractAddressIndex: null,
//   contract: null,
//   isAdmin: false,
//   isVoter: false,
//   workflowIndex: null,
// };
/*
@notice : reset state of the vote context
*/
// const resetSate = {
//   contractAddressIndex: null,
//   contract: null,
//   isAdmin: false,
//   isVoter: false,
//   workflowIndex: null,
// };

/*
@notice : reducer to manipulate the state of the contracts context
@dev : via useContracts hook we can access to the state and dispatch actions
@params : contractsState : current state of the contracts context 
@params : action : action to dispatch (type, payload)
@todo : refactor
*/
const reducer = (contractsState, action) => {
  const { type, data } = action;

  switch (type) {
    case actions.init:
      return { ...contractsState, ...data };

    // case actions.reset:
    //   return { ...voteState, ...resetSate };
    // case actions.addNewVote: {
    //   const deployedAddresses = [
    //     ...contractsState.deployedAddresses,
    //     data.contractAddress,
    //   ];

    //   const addData = {
    //     deployedAddresses,
    //     contractAddressIndex: deployedAddresses.length - 1,
    //     contract: data.contract,
    //   };
    //   return { ...voteState, ...addData };
    // }
    // case actions.loadVote:
    //   const contractAddressIndex = voteState.deployedAddresses.indexOf(
    //     data.contract.options.address
    //   );

    //   const loadData = {
    //     contractAddressIndex,
    //     contract: data.contract,
    //     isAdmin: data.isAdmin,
    //     isVoter: data.isVoter,
    //     workflowIndex: data.workflowIndex,
    //   };
    //   return { ...voteState, ...loadData };
    // case actions.updateVote:
    //   const freshData = {
    //     isAdmin: data.isAdmin,
    //     isVoter: data.isVoter,
    //     workflowIndex: data.workflowIndex,
    //   };
    //   return { ...voteState, ...freshData };

    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
