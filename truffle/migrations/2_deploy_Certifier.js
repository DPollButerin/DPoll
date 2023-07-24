const Certifier = artifacts.require("Certifier");

module.exports = async function (deployer, network, accounts) {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  let CertifierInstance;

  const beforeMsg =
    "\n*************************************************************************\n";
  const afterMsg =
    "\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
  const deployHeaderMsg = "======> DEPLOYING : ";
  const headerMsg = "--->";

  // if (network === "development") {
  console.log(beforeMsg + deployHeaderMsg + "%s" + afterMsg, "Certifier");
  await deployer.deploy(Certifier, { from: ADMIN });

  CertifierInstance = await Certifier.deployed();
  CertifierAddress = CertifierInstance.address;

  console.log(
    headerMsg + "%s" + "%s",
    "Certifier address : ",
    CertifierAddress
  );
  console.log(headerMsg + "%s" + "%s", "Certifier owner address : ", ADMIN);
  // }
};
