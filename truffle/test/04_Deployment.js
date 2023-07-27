const { assert, expect } = require("chai");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
// const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
// import web3 from "web3";
// const TestPollHelper = artifacts.require("TestPollHelper");
// const PollView = artifacts.require("PollView");
// const PollHelpers = artifacts.require("PollHelpers");
const DPollDAO = artifacts.require("DPollDAO");
const DPollPluginValidator = artifacts.require("DPollPluginValidator");
const DPollPluginProposals = artifacts.require("DPollPluginProposals");
const DPollToken = artifacts.require("DPollToken");

/*
These tests will test internals functions of Poll contract (in PollView, PollHelpers)
TestPollHelper is a contract that inherit from PollUser and so from PollView and PollHelpers. It's only used for testing purpose and is not deployed on the blockchain
*/
contract("DPollToken", (accounts) => {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  let DPollTokenInstance;

  it("should deploy DPollToken", async () => {
    DPollTokenInstance = await DPollToken.new(
      new BN("1000000000000000000000000"),
      { from: ADMIN }
    );
    assert(DPollTokenInstance.address);
  });
  it("should mint 1_000_000 DPTtoken to ADMIN", async () => {
    DPollTokenInstance = await DPollToken.new(
      new BN("1000000000000000000000000"),
      { from: ADMIN }
    );
    const adminBalance = await DPollTokenInstance.balanceOf(ADMIN);
    expect(adminBalance.toString()).to.equal("1000000000000000000000000");
  });
});

contract("DPollDAO", (accounts) => {
  const [ADMIN, USER1, USER2, USER3] = accounts;

  describe("DAO and plugins deployment", () => {
    let DPollDAOInstance;
    let DPollTokenInstance;
    let DPollPluginValidatorsInstance;
    let DPollPluginProposalsInstance;

    it("should deploy DPollDAO", async () => {
      DPollDAOInstance = await DPollDAO.new({ from: ADMIN });
      // console.log(DPollDAOInstance.address);
      assert(DPollDAOInstance.address);
    });

    describe("during DPollDAO deployment", () => {
      beforeEach(async () => {
        DPollDAOInstance = await DPollDAO.new({ from: ADMIN });
      });
      it("should set ADMIN as owner of DPollDAO", async () => {
        const owner = await DPollDAOInstance.owner();
        assert.equal(owner, ADMIN);
      });
      it("should deploy DPollToken", async () => {
        const DPTtokenAddress = await DPollDAOInstance.getDPTtokenAddress();
        assert(DPTtokenAddress);
      });
      it("should mint 1_000_000 DPTtoken to DAO", async () => {
        const DPTtokenAddress = await DPollDAOInstance.getDPTtokenAddress();
        DPollTokenInstance = await DPollToken.at(DPTtokenAddress);
        const DAODPTbalance = await DPollTokenInstance.balanceOf(
          DPollDAOInstance.address
        );
        // console.log(DAODPTbalance.toString());
        // console.log(DPollDAOInstance.address);
        expect(DAODPTbalance.toString()).to.equal("1000000000000000000000000");
      });
    });
    describe("Plugins deployment", () => {
      beforeEach(async () => {
        DPollDAOInstance = await DPollDAO.new({ from: ADMIN });
      });
      it("should deploy DPollPluginValidator", async () => {
        DPollPluginValidatorsInstance = await DPollPluginValidator.new(
          DPollDAOInstance.address,
          { from: ADMIN }
        );
        assert(DPollPluginValidatorsInstance.address);
      });
      it("should set ADMIN as owner of DPollPluginValidator", async () => {
        const owner = await DPollPluginValidatorsInstance.owner();
        assert.equal(owner, ADMIN);
      });
      it("should deploy DPollPluginProposals", async () => {
        const DPollTokenAddress = await DPollDAOInstance.getDPTtokenAddress();
        DPollPluginProposalsInstance = await DPollPluginProposals.new(
          DPollDAOInstance.address,
          DPollTokenAddress,
          { from: ADMIN }
        );
        assert(DPollPluginProposalsInstance.address);
      });
      it("should set ADMIN as owner of DPollPluginProposals", async () => {
        const owner = await DPollPluginProposalsInstance.owner();
        assert.equal(owner, ADMIN);
      });
    });
    describe("DAO plugins registration", () => {
      beforeEach(async () => {
        DPollDAOInstance = await DPollDAO.new({ from: ADMIN });
        const DPollTokenAddress = await DPollDAOInstance.getDPTtokenAddress();
        DPollPluginValidatorsInstance = await DPollPluginValidator.new(
          DPollDAOInstance.address,
          { from: ADMIN }
        );
        DPollPluginProposalsInstance = await DPollPluginProposals.new(
          DPollDAOInstance.address,
          DPollTokenAddress,
          { from: ADMIN }
        );
      });
      it("should set DPollPluginValidator in DAO", async () => {
        await DPollDAOInstance.setValidatorPluginAddress(
          DPollPluginValidatorsInstance.address,
          { from: ADMIN }
        );
        const validatorPluginAddress =
          await DPollDAOInstance.getValidatorPluginAddress();
        expect(validatorPluginAddress).to.equal(
          DPollPluginValidatorsInstance.address
        );
      });
      it("should set DPollPluginProposals in DAO", async () => {
        await DPollDAOInstance.setProposalsPluginAddress(
          DPollPluginProposalsInstance.address,
          { from: ADMIN }
        );
        const proposalsPluginAddress =
          await DPollDAOInstance.getProposalsPluginAddress();
        expect(proposalsPluginAddress).to.equal(
          DPollPluginProposalsInstance.address
        );
      });
      it("should revert if USER1 try to set DPollPluginValidator in DAO", async () => {
        await expectRevert(
          DPollDAOInstance.setValidatorPluginAddress(
            DPollPluginValidatorsInstance.address,
            { from: USER1 }
          ),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if USER1 try to set DPollPluginProposals in DAO", async () => {
        await expectRevert(
          DPollDAOInstance.setProposalsPluginAddress(
            DPollPluginProposalsInstance.address,
            { from: USER1 }
          ),
          "Ownable: caller is not the owner"
        );
      });
    });
  });
});
