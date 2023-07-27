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
const {
  mockDAO,
  mockDAOandPlugins,
  mockAddMember,
} = require("./test_helpers.js");
const { web3 } = require("@openzeppelin/test-helpers/src/setup.js");
/*
These tests will test internals functions of Poll contract (in PollView, PollHelpers)
TestPollHelper is a contract that inherit from PollUser and so from PollView and PollHelpers. It's only used for testing purpose and is not deployed on the blockchain
*/
contract("TEST_05/DPollDAO", (accounts) => {
  const [
    ADMIN,
    USER1,
    USER2,
    USER3,
    USER4,
    USER5,
    USER6,
    USER7,
    USER8,
    STRANGER,
  ] = accounts;
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
    it("should get infos of a member added", async () => {
      await DPollDAOInstance.addMember(USER1, {
        from: USER1,
        value: entryFees,
      });
      const member = await DPollDAOInstance.getMember(USER1);
      const txTime = await time.latest();
      // console.log(member);
      // console.log(txTime);
      expect(member.memberAddress).to.equal(USER1);
      expect(member.memberSince.toString()).to.equal(txTime.toString());
      expect(member.lastProposalCreation.toString()).to.equal("0");
      expect(member.balance.toString()).to.equal(entryFees);
      expect(member.rewardsBalance.toString()).to.equal("0");
      expect(member.role).to.equal((1).toString());
      //num 1 in string
    });
    it("should get the number of members added (3)", async () => {
      DPollDAOInstance = await mockAddMember(
        DPollDAOInstance,
        [USER1, USER2, USER3],
        entryFees
      );
      const numberOfMembers = await DPollDAOInstance.getMembersCount();
      expect(numberOfMembers.toString()).to.equal("3");
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
    describe("balance and rewards functions (plugins add are mocked)", () => {
      const donationInEth = "1";
      const donation = web3.utils.toWei(donationInEth, "ether");
      const amount = 0.05;
      const perValidator = amount / 2;
      const fees = 2 * amount;

      const validationFeesInEth = fees.toString();
      const validationFees = web3.utils.toWei(validationFeesInEth, "ether");
      const lessThanValidationFees = web3.utils.toWei("0.08", "ether");
      const amountInWei = web3.utils.toWei(amount.toString(), "ether");
      const perValidatorInWei = web3.utils.toWei(
        perValidator.toString(),
        "ether"
      );
      //   const feesToDao = (validationFees.toNumber() / 2).toString();
      const userList = [USER1, USER2, USER3];
      const mockedValidators = [USER1, USER2];
      const mockedValidatorPluginAddress = USER4;
      const mockedProposalsPluginAddress = USER5;

      beforeEach(async () => {
        [DPollDAOInstance, DPollTokenInstance] = await mockDAOandPlugins(ADMIN); //=> CHANGE TO mockDAO !!!!
        //set USER1, USER2, USER3 as members
        DPollDAOInstance = await mockAddMember(
          DPollDAOInstance,
          userList,
          entryFees
        );
        // set USER4 as pluginValidatorAddress and USER5 as pluginProposalsAddress
        await DPollDAOInstance.setValidatorPluginAddress(
          mockedValidatorPluginAddress,
          {
            from: ADMIN,
          }
        );
        await DPollDAOInstance.setProposalsPluginAddress(
          mockedProposalsPluginAddress,
          {
            from: ADMIN,
          }
        );
      });
      it("should return the balance of DAO contract : 0", async () => {
        const balance = await DPollDAOInstance.getDAOBalance();
        expect(balance.toString()).to.equal("0");
      });
      it(`should deposit 'donation' to DPollDAO and return balance : ${donationInEth} eth`, async () => {
        await DPollDAOInstance.deposit({
          from: USER1,
          value: donation,
        });
        const balance = await DPollDAOInstance.getDAOBalance();
        expect(balance.toString()).to.equal(donation);
      });
      it("should emit event when deposit", async () => {
        const tx = await DPollDAOInstance.deposit({
          from: USER1,
          value: donation,
        });
        expectEvent(tx, "DAOBalanceTansfer", {
          to: DPollDAOInstance.address,
          from: USER1,
          amount: donation,
          action: "Deposit",
        });
      });
      //@todo REFACTOR : => in atomic test and it inside forEach instead of in it !! AND CHECK DELTA BEFORE-AFTER (don't assume it's 0)
      it("should transfer validator fees to DAO and update validators balance", async () => {
        await DPollDAOInstance.payValidation(
          new BN(amountInWei),
          new BN(amountInWei),
          mockedValidators,
          {
            from: mockedValidatorPluginAddress,
            value: validationFees,
          }
        );

        const struct1 = await DPollDAOInstance.getMember(mockedValidators[0]);
        const struct2 = await DPollDAOInstance.getMember(mockedValidators[1]);
        expect(struct1.rewardsBalance.toString()).to.equal(perValidatorInWei);
        expect(struct2.rewardsBalance.toString()).to.equal(perValidatorInWei);

        const newDAObalance = await DPollDAOInstance.getDAOBalance();
        expect(newDAObalance.toString()).to.equal(amountInWei);
      });
      it("should revert if another address than pluginValidatorAddress try to payValidation", async () => {
        await expectRevert(
          DPollDAOInstance.payValidation(
            new BN(amountInWei),
            new BN(amountInWei),
            mockedValidators,
            {
              from: USER1,
              value: validationFees,
            }
          ),
          "Only the validator contract can reward validators"
        );
      });
      it("should revert if value sent <= input amounts", async () => {
        await expectRevert(
          DPollDAOInstance.payValidation(
            new BN(amountInWei),
            new BN(amountInWei),
            mockedValidators,
            {
              from: mockedValidatorPluginAddress,
              value: lessThanValidationFees,
            }
          ),
          "The amount to split dont match the amount sent"
        );
      });
      it("should withdraw rewards to USER1 if rewardsBalance > 0", async () => {
        await DPollDAOInstance.payValidation(
          new BN(amountInWei),
          new BN(amountInWei),
          mockedValidators,
          {
            from: mockedValidatorPluginAddress,
            value: validationFees,
          }
        );
        let struct1 = await DPollDAOInstance.getMember(mockedValidators[0]);
        const rewardsBeforeWithDraw = struct1.rewardsBalance.toString();
        const balanceBeforeWithDraw = await web3.eth.getBalance(
          mockedValidators[0]
        );
        const tx = await DPollDAOInstance.withdrawReward({
          from: mockedValidators[0],
        });
        //get fees of tx
        const gasUsed = new BN(tx.receipt.gasUsed);
        const txHash = tx.tx;
        const transaction = await web3.eth.getTransaction(txHash);
        const gasPrice = new BN(transaction.gasPrice);
        const txFees = gasUsed.mul(gasPrice);

        struct1 = await DPollDAOInstance.getMember(mockedValidators[0]);
        const rewardsAfterWithDraw = struct1.rewardsBalance.toString();
        const balanceAfterWithDraw = await web3.eth.getBalance(
          mockedValidators[0]
        );
        expect(rewardsBeforeWithDraw).to.equal(perValidatorInWei);
        expect(rewardsAfterWithDraw).to.equal("0");
        //need to retreive tx fees
        expect(balanceAfterWithDraw.toString()).to.equal(
          new BN(balanceBeforeWithDraw)
            .add(new BN(perValidatorInWei))
            .sub(txFees)
            .toString()
        );
      });
      it("should emit event when withdraw rewards", async () => {
        await DPollDAOInstance.payValidation(
          new BN(amountInWei),
          new BN(amountInWei),
          mockedValidators,
          {
            from: mockedValidatorPluginAddress,
            value: validationFees,
          }
        );
        const tx = await DPollDAOInstance.withdrawReward({
          from: mockedValidators[0],
        });
        expectEvent(tx, "DAOBalanceTansfer", {
          to: mockedValidators[0],
          from: DPollDAOInstance.address,
          amount: perValidatorInWei,
          action: "Reward claimed",
        });
      });
      it("should revert withdrawal if rewardsBalance = 0", async () => {
        await expectRevert(
          DPollDAOInstance.withdrawReward({
            from: USER1,
          }),
          "You don't have any reward"
        );
      });
    });
    describe("DPollToken rewards functions", () => {
      const userList = [USER1, USER2, USER3];
      //   const mockedValidators = [USER1, USER2];
      const mockedValidatorPluginAddress = USER4;
      const mockedProposalsPluginAddress = USER5;
      beforeEach(async () => {
        [DPollDAOInstance, DPollTokenInstance] = await mockDAOandPlugins(ADMIN);
        //set USER1, USER2, USER3 as members
        DPollDAOInstance = await mockAddMember(
          DPollDAOInstance,
          userList,
          entryFees
        );
        // set USER4 as pluginValidatorAddress and USER5 as pluginProposalsAddress
        await DPollDAOInstance.setValidatorPluginAddress(
          mockedValidatorPluginAddress,
          {
            from: ADMIN,
          }
        );
        await DPollDAOInstance.setProposalsPluginAddress(
          mockedProposalsPluginAddress,
          {
            from: ADMIN,
          }
        );
      });
      it("should give 1 token to USER1 via 'rewardValidator' from Validator, with event 'DAOTokenTransfer'", async () => {
        const DPTaddress = await DPollDAOInstance.getDPTtokenAddress();
        const DPTinstance = await DPollToken.at(DPTaddress);
        const prevDPTbalance = await DPTinstance.balanceOf(USER1);
        const reward = web3.utils.toWei("1", "ether");
        const tx = await DPollDAOInstance.rewardValidator(USER1, {
          from: mockedValidatorPluginAddress,
        });
        const newDPTbalance = await DPTinstance.balanceOf(USER1);
        expect(newDPTbalance.toString()).to.equal(
          new BN(prevDPTbalance).add(new BN(reward)).toString()
        );
        expectEvent(tx, "DAOTokenTransfer", {
          to: USER1,
          amount: reward,
          action: "Reward",
        });
      });
      //   it("should emit event DAOTokenTransfer when rewardValidator", async () => {
      //     const reward = web3.utils.toWei("1", "ether");
      //     const tx = await DPollDAOInstance.rewardValidator(USER1, {
      //       from: mockedValidatorPluginAddress,
      //     });
      //     expectEvent(tx, "DAOTokenTransfer", {
      //       to: USER1,
      //       amount: reward,
      //       action: "Reward",
      //     });
      //   });
      it("should revert if another address than pluginValidatorAddress try to rewardValidator", async () => {
        await expectRevert(
          DPollDAOInstance.rewardValidator(USER1, {
            from: USER1,
          }),
          "Only the validator contract can reward validators"
        );
      });
      it("should give 1 token to USER1 via 'rewardVoter' from Proposals plugin, with event 'DAOTokenTransfer'", async () => {
        const DPTaddress = await DPollDAOInstance.getDPTtokenAddress();
        const DPTinstance = await DPollToken.at(DPTaddress);
        const prevDPTbalance = await DPTinstance.balanceOf(USER1);
        const reward = web3.utils.toWei("1", "ether");
        const tx = await DPollDAOInstance.rewardVoter(USER1, {
          from: mockedProposalsPluginAddress,
        });
        // const eventArgs = tx.logs[0].args;

        const newDPTbalance = await DPTinstance.balanceOf(USER1);
        expect(newDPTbalance.toString()).to.equal(
          new BN(prevDPTbalance).add(new BN(reward)).toString()
        );
        expectEvent(tx, "DAOTokenTransfer", {
          to: USER1,
          amount: reward,
          action: "Reward",
        });
      });
      //   it("should emit event DAOTokenTransfer when rewardVoter", async () => {
      //     const reward = web3.utils.toWei("1", "ether");
      //     const tx = await DPollDAOInstance.rewardValidator(USER1, {
      //       from: mockedProposalsPluginAddress,
      //     });
      //     expectEvent(tx, "DAOTokenTransfer", {
      //       to: USER1,
      //       amount: reward,
      //       action: "Reward",
      //     });
      //   });
      it("should revert if another address than pluginProposalsAddress try to rewardVoter", async () => {
        await expectRevert(
          DPollDAOInstance.rewardVoter(USER1, {
            from: USER1,
          }),
          "Only the proposals contract can reward voters"
        );
      });
    });
  });
});
