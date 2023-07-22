const { assert, expect } = require("chai");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
// const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
// import web3 from "web3";
const TestPollHelper = artifacts.require("TestPollHelper");
const PollView = artifacts.require("PollView");
const PollHelpers = artifacts.require("PollHelpers");
const DPollDAO = artifacts.require("DPollDAO");
const DPollPluginValidator = artifacts.require("DPollPluginValidator");
const DPollPluginProposals = artifacts.require("DPollPluginProposals");
const DPollToken = artifacts.require("DPollToken");

const { mockDAO, mockDAOandPlugins } = require("./test_helpers.js");

contract("HELPERS/mockDAO", async (accounts) => {
  let DPollDAOInstance, DPollTokenInstance;
  const [ADMIN, USER1, USER2, USER3] = accounts;
  before(async () => {
    [DPollDAOInstance, DPollTokenInstance] = await mockDAO(ADMIN);
  });

  describe("mockDAO", () => {
    it("should deploy DPollDAO", async () => {
      assert(DPollDAOInstance.address);
    });
    it("should deploy DPollToken and mint 1_000_000 DPTtoken to DAO", async () => {
      const daoBalance = await DPollTokenInstance.balanceOf(
        DPollDAOInstance.address
      );
      expect(daoBalance.toString()).to.equal("1000000000000000000000000");
    });
  });
});

contract("HELPERS/mockDAOandPlugins", async (accounts) => {
  let DPollDAOInstance,
    DPollPluginValidatorsInstance,
    DPollPluginProposalsInstance,
    DPollTokenInstance;
  const [ADMIN, USER1, USER2, USER3] = accounts;
  before(async () => {
    [
      DPollDAOInstance,
      DPollPluginValidatorsInstance,
      DPollPluginProposalsInstance,
      DPollTokenInstance,
    ] = await mockDAOandPlugins(ADMIN);
  });
  describe("mockDAOandPlugins", () => {
    it("should deploy DPollDAO", async () => {
      assert(DPollDAOInstance.address);
    });
    it("should deploy DPollToken", async () => {
      assert(DPollTokenInstance.address);
    });
    it("should mint 1_000_000 DPTtoken to DAO", async () => {
      const daoBalance = await DPollTokenInstance.balanceOf(
        DPollDAOInstance.address
      );
      expect(daoBalance.toString()).to.equal("1000000000000000000000000");
    });
    it("should deploy DPollPluginValidator", async () => {
      assert(DPollPluginValidatorsInstance.address);
    });
    it("should deploy DPollPluginProposals", async () => {
      assert(DPollPluginProposalsInstance.address);
    });
    it("should set plugins addresses in DAO", async () => {
      const validatorPluginAddress =
        await DPollDAOInstance.getValidatorPluginAddress();
      const proposalsPluginAddress =
        await DPollDAOInstance.getProposalsPluginAddress();
      expect(validatorPluginAddress).to.equal(
        DPollPluginValidatorsInstance.address
      );
      expect(proposalsPluginAddress).to.equal(
        DPollPluginProposalsInstance.address
      );
    });
    it("should set ADMIN as owner of DAO and plugins", async () => {
      const daoOwner = await DPollDAOInstance.owner();
      const validatorPluginOwner = await DPollPluginValidatorsInstance.owner();
      const proposalsPluginOwner = await DPollPluginProposalsInstance.owner();
      expect(daoOwner).to.equal(ADMIN);
      expect(validatorPluginOwner).to.equal(ADMIN);
      expect(proposalsPluginOwner).to.equal(ADMIN);
    });
  });
});
