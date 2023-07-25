const PollMaster = artifacts.require("PollMaster");
const PollFactory = artifacts.require("PollFactory");
const Certifier = artifacts.require("Certifier");
const DPollDAO = artifacts.require("DPollDAO");

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

  // if (network === "development") {
  console.log(
    beforeMsg + "%s" + afterMsg,
    "CHECK PREVIOUS ADDRESSES DEPLOYMENT"
  );
  const DPollDAOInstance = await DPollDAO.deployed();
  const DPollDAOAddress = DPollDAOInstance.address;
  console.log(headerMsg + "%s" + "%s", "DPollDAO address : ", DPollDAOAddress);
  console.log(headerMsg + "%s" + "%s", "DPollDAO owner address : ", ADMIN);

  console.log(
    beforeMsg + "%s" + afterMsg,
    "CHECK PREVIOUS ADDRESSES DEPLOYMENT"
  );
  const certifierInstance = await Certifier.deployed();
  const certifierAddress = certifierInstance.address;
  console.log(
    headerMsg + "%s" + "%s",
    "Certifier address : ",
    certifierAddress
  );
  console.log(headerMsg + "%s" + "%s", "Certifier owner address : ", ADMIN);

  console.log(beforeMsg + deployHeaderMsg + "%s" + afterMsg, "POLL FACTORY");
  await deployer.deploy(PollFactory, DPollDAOAddress, certifierAddress, {
    from: ADMIN,
  });

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
  pollMasterAddress = pollMasterInstance.address;

  console.log(
    headerMsg + "%s" + "%s",
    "PollMaster address : ",
    pollMasterAddress
  );
  console.log(
    headerMsg + "%s" + "%s",
    "Setting PollMaster address in PollFactory "
  );
  await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
    from: ADMIN,
  });
  const confirm = await pollFactoryInstance.getMasterPollAddress();
  console.log(
    "PollMaster address set in PollFactory : ",
    confirm,
    "\nshould be : ",
    pollMasterAddress
  );
  // }
};
