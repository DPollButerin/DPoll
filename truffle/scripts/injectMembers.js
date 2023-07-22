/*
  Try `truffle exec scripts/increment.js`, you should `truffle migrate` first.

  Learn more about Truffle external scripts: 
  https://trufflesuite.com/docs/truffle/getting-started/writing-external-scripts
*/

const DPollDAO = artifacts.require("DPollDAO");

module.exports = async function (callback) {
  //get web3
  const Web3 = require("web3");
  //get provider from ganache
  const provider = new Web3.providers.HttpProvider("http://localhost:8545");
  //get web3 instance
  const web3 = new Web3(provider);

  //get network
  const network = await web3.eth.net.getNetworkType();
  console.log(`Network: ${network}`);
  const deployed = await DPollDAO.deployed();

  const accounts = await web3.eth.getAccounts();
  const ADMIN = accounts[0];
  const MEMBER1 = accounts[1];
  const MEMBER2 = accounts[2];
  const MEMBER3 = accounts[3];
  const MEMBER4 = accounts[4];

  //set amount to 0.02 ETH in wei
  const AMOUNT = web3.utils.toWei("0.03", "ether");
  //add member to DAO
  const receipt = await deployed.addMember(MEMBER3, {
    value: AMOUNT,
    from: MEMBER3,
  });
  console.log(`Confirmed transaction ${receipt.tx}`);
  console.log(`Member1 added to DAO: ${{ ...receipt }}`);

  //get abi
  const abi = deployed.abi;
  //get add DAO
  const address = deployed.address;
  console.log(`DAO address: ${address}`);

  //test if member is added
  const isMember = await deployed.isMember(MEMBER3);
  console.log(`Member1 is added: ${isMember}`);

  ///ne passe pas!! ensuite => changer methode

  const contract = new web3.eth.Contract(abi, address);

  await contract.methods.addMember(MEMBER4).send({
    from: MEMBER4,
    value: AMOUNT,
  });
  console.log(`Member2 added to DAO: ${{ ...receipt }}`);
  const res = await contract.methods.isMember(MEMBER4).call({ from: MEMBER4 }); //.then(console.log);
  console.log(`Member2 is added: ${res}`);

  //   const deployed = await SimpleStorage.deployed();

  //   const currentValue = (await deployed.read()).toNumber();
  //   console.log(`Current SimpleStorage value: ${currentValue}`);

  //   const { tx } = await deployed.write(currentValue + 1);
  //   console.log(`Confirmed transaction ${tx}`);

  //   const updatedValue = (await deployed.read()).toNumber();
  //   console.log(`Updated SimpleStorage value: ${updatedValue}`);

  callback();
};
