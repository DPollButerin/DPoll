const { assert, expect } = require("chai");
const {
  BN,
  expectRevert,
  expectEvent,
  time,
} = require("@openzeppelin/test-helpers");
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
const { mockDAO, mockDAOandPlugins } = require("./test_helpers.js");
const { web3 } = require("@openzeppelin/test-helpers/src/setup.js");
/*
These tests will test internals functions of Poll contract (in PollView, PollHelpers)
TestPollHelper is a contract that inherit from PollUser and so from PollView and PollHelpers. It's only used for testing purpose and is not deployed on the blockchain
*/
contract("TEST_05/DPollDAO", (accounts) => {
  const [ADMIN, USER1, USER2, USER3] = accounts;
  let DPollDAOInstance, DPollTokenInstance;
  const entryFees = web3.utils.toWei("0.02", "ether");
  const lowerThanEntryFees = web3.utils.toWei("0.01", "ether");
  beforeEach(async () => {
    [DPollDAOInstance, DPollTokenInstance] = await mockDAO(ADMIN);
  });

  describe("adding a member", () => {
    it("ADMIN should be set as member at DAO deployment", async () => {
      const isAdminMember = await DPollDAOInstance.isMember(ADMIN);
      expect(isAdminMember).to.equal(true);
    });
    it("revert if admin try to add himself as member again", async () => {
      await expectRevert(
        DPollDAOInstance.addMember(ADMIN, {
          from: ADMIN,
          value: entryFees,
        }),
        "You are already a member"
      );
    });
    it("should add USER1 as member", async () => {
      await DPollDAOInstance.addMember(USER1, {
        from: USER1,
        value: entryFees,
      });
      const isUser1Member = await DPollDAOInstance.isMember(USER1);
      expect(isUser1Member).to.equal(true);
    });
    it("should revert if USER1 don't send enough entryFees", async () => {
      await expectRevert(
        DPollDAOInstance.addMember(USER1, {
          from: USER1,
          value: lowerThanEntryFees,
        }),
        "You need to send at least 0.02 ether"
      );
    });
    describe("removing a member", () => {
      beforeEach(async () => {
        await DPollDAOInstance.addMember(USER1, {
          from: USER1,
          value: entryFees,
        });
      });
      it("should revert if member since less than 28days", async () => {
        await expectRevert(
          DPollDAOInstance.removeMember(USER1, {
            from: USER1,
          }),
          "You need to wait 28 days before leaving the DAO"
        );
      });
      it("should revert if ADMIN try to remove USER1", async () => {
        await expectRevert(
          DPollDAOInstance.removeMember(USER1, {
            from: ADMIN,
          }),
          "Only member can decide to leave the DAO"
        );
      });
      it("should remove USER1 after 28 days", async () => {
        //advance 1 block to correctly read time in solidity 'now' interpreted by ganache
        await time.advanceBlock();
        //advance 28 days
        await time.increase(time.duration.days(29));
        //remove member
        await DPollDAOInstance.removeMember(USER1, {
          from: USER1,
        });
        const isUser1Member = await DPollDAOInstance.isMember(USER1);
        expect(isUser1Member).to.equal(false);
      });
    });
  });
});
