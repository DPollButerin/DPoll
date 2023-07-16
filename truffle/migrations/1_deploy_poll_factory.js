const PollMaster = artifacts.require("PollMaster");
const PollFactory = artifacts.require("PollFactory");
const Certifier = artifacts.require("Certifier");

module.exports = async function (deployer, network, accounts) {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  let pollFactoryInstance;
  let pollMasterInstance;
  let pollFactoryAddress;
  let polMasterAddress;

  const beforeMsg =
    "\n*************************************************************************\n";
  const afterMsg =
    "\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
  const deployHeaderMsg = "======> DEPLOYING : ";
  const headerMsg = "--->";

  if (network === "development") {
    console.log(beforeMsg + deployHeaderMsg + "%s" + afterMsg, "POLL FACTORY");
    await deployer.deploy(PollFactory, { from: ADMIN });

    pollFactoryInstance = await PollFactory.deployed();
    pollFactoryAddress = pollFactoryInstance.address;

    console.log(
      headerMsg + "%s" + "%s",
      "PollFactory address : ",
      pollFactoryAddress
    );

    console.log(beforeMsg + deployHeaderMsg + "%s" + afterMsg, "POLL MASTER");
    await deployer.deploy(PollMaster, pollFactoryAddress, { from: ADMIN });

    pollMasterInstance = await PollMaster.deployed();
    polMasterAddress = pollMasterInstance.address;

    console.log(
      headerMsg + "%s" + "%s",
      "PollMaster address : ",
      polMasterAddress
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
