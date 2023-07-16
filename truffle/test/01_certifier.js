const { assert, expect } = require("chai");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
// import web3 from "web3";
const Certifier = artifacts.require("Certifier");

contract("Certifier", (accounts) => {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  const criteria = "TEST";
  const target = USER1;
  //subject: 'keccak256(abi.encodePacked(target, criteria))'
  const subject = web3.utils.soliditySha3(
    web3.utils.encodePacked(
      { type: "address", value: target },
      { type: "string", value: criteria }
    )
  );
  const proof = web3.utils.soliditySha3("I claim this address is certified");
  const method = web3.utils.soliditySha3("fake method");

  let certifierInstance;

  beforeEach(async () => {
    certifierInstance = await Certifier.new({ from: ADMIN });
  });

  it("should deploy certifier", async () => {
    assert(certifierInstance.address);
  });
  it("should emit event when certifier check eligibility of USER1", async () => {
    const certifier = certifierInstance.address;
    const tx = await certifierInstance.checkEligibility("TEST", target, {
      from: ADMIN,
    });
    await expectEvent(tx, "CertificationEvent", {
      certifier: certifier,
      subject: subject,
      proof: proof,
      method: method,
    });
  });
  it("should return the Certification Struct of USER1", async () => {
    const certifier = certifierInstance.address;
    const tx = await certifierInstance.checkEligibility("TEST", target, {
      from: ADMIN,
    });
    //console.log(tx, tx.receipt.logs, tx.receipt.rawLogs, tx.logs[0].args);
    expect(tx.logs[0].args.certifier).to.equal(certifier);
    expect(tx.logs[0].args.subject).to.equal(subject);
    expect(tx.logs[0].args.proof).to.equal(proof);
    expect(tx.logs[0].args.method).to.equal(method);
  });
});
