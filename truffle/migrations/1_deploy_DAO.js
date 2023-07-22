// const PollMaster = artifacts.require("PollMaster");
// const PollFactory = artifacts.require("PollFactory");
// const Certifier = artifacts.require("Certifier");
const DPollDAO = artifacts.require("DPollDAO");
const DPollPluginValidator = artifacts.require("DPollPluginValidator");
const DPollPluginProposals = artifacts.require("DPollPluginProposals");
const DPollToken = artifacts.require("DPollToken");

module.exports = async function (deployer, network, accounts) {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  let DPollDAOInstance;

  const beforeMsg =
    "\n*************************************************************************\n";
  const afterMsg =
    "\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
  const deployHeaderMsg = "======> DEPLOYING : ";
  const headerMsg = "--->";

  if (network === "development") {
    console.log(beforeMsg + deployHeaderMsg + "%s" + afterMsg, "DPoll DAO");
    await deployer.deploy(DPollDAO, { from: ADMIN });

    DPollDAOInstance = await DPollDAO.deployed();
    DPollDAOAddress = DPollDAOInstance.address;

    console.log(
      headerMsg + "%s" + "%s",
      "DPollDAO address : ",
      DPollDAOAddress
    );
    console.log(headerMsg + "%s" + "%s", "DPollDAO owner address : ", ADMIN);

    //get address of DPTtoken deployed in DAO creation
    const DPTtokenAddress = await DPollDAOInstance.DPTtoken();
    // const DPTtokenAddress2 = await DPollDAOInstance.getDPTtokenAddress();
    console.log(headerMsg + "%s" + "%s", "DPTtokenAddress : ", DPTtokenAddress);
    // console.log(
    //   headerMsg + "%s" + "%s",
    //   "DPTtokenAddress2 : ",
    //   DPTtokenAddress2
    // );
    const DPTtokenInstance = await artifacts
      .require("DPollToken")
      .at(DPTtokenAddress);
    const DPTtokenName = await DPTtokenInstance.name();
    const DPTtokenSymbol = await DPTtokenInstance.symbol();
    const DPTtokenSupply = await DPTtokenInstance.totalSupply();
    // const DPTtokenOwner = await DPTtokenInstance.owner();
    // console.log(headerMsg + "%s" + "%s", " DPTtokenOwner : ", DPTtokenOwner);
    const DAODPTbalance = await DPTtokenInstance.balanceOf(DPollDAOAddress);
    console.log(
      headerMsg + "%s" + "%s",
      " DAODPTbalance : ",
      DAODPTbalance.toString()
    );
    console.log(
      headerMsg + "%s" + "%s" + "%s" + "%s",
      " DPTtokenName : ",
      DPTtokenName,
      " DPTtokenSymbol : ",
      DPTtokenSymbol,
      " DPTtokenSupply : ",
      DPTtokenSupply.toString()
    );

    console.log(
      beforeMsg + deployHeaderMsg + "%s" + afterMsg,
      "DAO, VALIDATOR PLUGIN"
    );
    await deployer.deploy(DPollPluginValidator, DPollDAOAddress, {
      from: ADMIN,
    });

    DPollValidatorInstance = await DPollPluginValidator.deployed();
    DPollValidatorAddress = DPollValidatorInstance.address;
    console.log(
      headerMsg + "%s" + "%s",
      "Validator plugin Address : ",
      DPollValidatorAddress
    );

    console.log(
      beforeMsg + deployHeaderMsg + "%s" + afterMsg,
      "DAO, PROPOSALS PLUGIN"
    );
    await deployer.deploy(
      DPollPluginProposals,
      DPollDAOAddress,
      DPTtokenAddress,
      {
        from: ADMIN,
      }
    );

    DPollProposalsInstance = await DPollPluginProposals.deployed();
    DPollProposalsAddress = DPollProposalsInstance.address;
    console.log(
      headerMsg + "%s" + "%s",
      "Proposals plugin Address : ",
      DPollProposalsAddress
    );
  }
};

// const Storage = artifacts.require("Storage");
// // import web3 from "web3";

// module.exports = async function (deployer, network, accounts) {
//   const valToSend = web3.utils.toWei("1", "ether");
//   const valToSendGoerli = web3.utils.toWei("0.001", "ether");
//   const account1 = accounts[0];

//   if (network === "development") {
//     await deployer.deploy(Storage, 5, {
//       //   overwrite: false,
//       from: `${account1}`,
//       value: `${valToSend}`,
//     });
//   } else if (network === "goerli") {
//     await deployer.deploy(Storage, 5, {
//       //   overwrite: false,
//       from: `${account1}`,
//       value: `${valToSendGoerli}`,
//     });
//   }
// };

// module.exports = async function (deployer, network, accounts) {
//   if (network === "development") {
//     const instance = await Storage.deployed();
//     let value = await instance.get();
//     console.log("initial value : ", value.toString());

//     await instance.set(10);
//     value = await instance.get();
//     console.log("new value : ", value.toString());

//     web3.eth.getAccounts().then(console.log);

//     let balance = await web3.eth.getBalance(instance.address);

//     console.log(
//       "instance.address balance: " +
//         web3.utils.fromWei(balance, "ether") +
//         " ETH"
//     );
//   }
// };
