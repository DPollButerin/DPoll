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
const PollFactory = artifacts.require("PollFactory");
const PollMaster = artifacts.require("PollMaster");
const Certifier = artifacts.require("Certifier");
const IDAOmembership = artifacts.require("IDAOmembership");
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
contract("TEST_09/WORKFLOW => DAOvalidation", (accounts) => {
  //mock DAO and plugins deployment to get their instances
  //test factory deployment (with DAO and certifier addresses in constructor)
  //test access of PollFactory functions
  //test create clone
  //test get PollMaster address
  //test fetching clones addresses

  let pollFactoryInstance;
  let pollFactoryAddress;
  let pollMasterInstance;
  let pollMasterAddress;
  let DPollDAOInstance;
  let DPollDAOAddress;
  let certifierInstance;
  let certifierAddress;
  let DPollPluginValidatorInstance;
  let DPollPluginValidatorAddress;
  let DPollPluginProposalsInstance;
  let DPollTokenInstance;
  let pollInstance; //clone
  let pollAddress;

  const [
    ADMIN,
    MEMBER1,
    MEMBER2,
    MEMBER3,
    MEMBER4,
    MEMBER5,
    MEMBER6,
    MEMBER7,
    MEMBER8,
    STRANGER,
  ] = accounts;

  const pollCreationArgs1 = {
    responsesCount: 1,
    name: "TEST NAME 1",
    description: "TEST DESCRIPTION 1",
    criteria: "FAKE CRITERIA",
  };
  const pollCreationArgs2 = {
    responsesCount: 2,
    name: "TEST NAME 2",
    description: "TEST DESCRIPTION 2",
    criteria: "FAKE CRITERIA",
  };

  const questions = ["TEST QUESTION BATCH 1", "TEST QUESTION BATCH 2"];
  const answers = [
    ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
    ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
  ];
  const entryFees = web3.utils.toWei("0.02", "ether");
  const DAOentryFees = web3.utils.toWei("0.02", "ether");
  const minPollCost = web3.utils.toWei("0.05", "ether");
  const minCostPerResponse = web3.utils.toWei("0.0001", "ether");
  const pollCost1 = web3.utils.toWei("0.0501", "ether"); //plus additonal cost per response 0.05 + 0.0001 (arg1 = 1 response)
  const pollCost2 = web3.utils.toWei("0.051", "ether");
  const insufficientPollFund = web3.utils.toWei("0.05", "ether");

  const userList = [MEMBER1, MEMBER2, MEMBER3];

  describe("Validators vote to validate the poll", () => {
    const userList = [MEMBER1, MEMBER2, MEMBER3];
    beforeEach(async () => {
      [
        DPollDAOInstance,
        DPollPluginValidatorInstance,
        DPollPluginProposalsInstance,
        DPollTokenInstance,
      ] = await mockDAOandPlugins(ADMIN);
      DPollDAOAddress = DPollDAOInstance.address;

      certifierInstance = await Certifier.new({ from: ADMIN });
      certifierAddress = certifierInstance.address;

      DPollPluginValidatorAddress = DPollPluginValidatorInstance.address;

      pollFactoryInstance = await PollFactory.new(
        DPollDAOAddress,
        certifierAddress,
        DPollPluginValidatorAddress,
        { from: ADMIN }
      );
      pollFactoryAddress = pollFactoryInstance.address;
      pollMasterInstance = await PollMaster.new(pollFactoryAddress, {
        from: ADMIN,
      });
      pollMasterAddress = pollMasterInstance.address;
      // //set pollMaster address in pollFactory
      await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        from: ADMIN,
      });
      //add member 1 to 3 as member of DAO
      DPollDAOInstance = await mockAddMember(
        DPollDAOInstance,
        userList,
        entryFees
      );

      //create the poll
      let tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );

      pollAddress = tx.logs[1].args.newPollContract;
      pollInstance = await PollMaster.at(pollAddress);
      //fill the poll

      tx = await pollInstance.addTopicsBatch(questions, answers, {
        from: MEMBER1,
      });

      tx = await pollInstance.submitPoll({ from: MEMBER1 });
    });

    it("should have set the number of required validators to 3 ", async () => {
      const requiredValidators =
        await DPollPluginValidatorInstance.requiredValidators();
      expect(requiredValidators.toString()).to.equal("3");
    });
    it("should have set the number of required validations to 2", async () => {
      const requiredValidations =
        await DPollPluginValidatorInstance.requiredValidations();
      expect(requiredValidations.toString()).to.equal("2");
    });
    it("should get the number of polls submitted to the DAO", async () => {
      const polls = await DPollPluginValidatorInstance.getPolls();
      expect(polls.length).to.equal(1);
    });
    it("should get the addresses of the polls submitted to the DAO", async () => {
      const polls = await DPollPluginValidatorInstance.getPolls();
      expect(polls[0].pollAddress).to.equal(pollAddress);
    });
    it("shoud revert if a non DAO member try to vote", async () => {
      await expectRevert(
        DPollPluginValidatorInstance.voteForPoll(0, true, { from: STRANGER }),
        "You are not a member"
      );
    });
    it("should let a DAO member vote", async () => {
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.voteCount.toString()).to.equal("1");
    });
    it("should set voteCount of the poll to 1 after a member vote", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.voteCount.toString()).to.equal("1");
    });
    it("shoul gave set the amount to DAO in the poll struct", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      const cost_10_pct = web3.utils.toWei("0.00501", "ether");
      expect(poll.amountToDAO.toString()).to.equal(cost_10_pct);
    });
    it("should have set the amount to validators in the poll struct", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      const cost_10_pct = web3.utils.toWei("0.00501", "ether");
      expect(poll.amountToValidators.toString()).to.equal(cost_10_pct);
    });
    //ne pas oublier la date de submission !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    it("should let a member reject a poll", async () => {
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.voteCount.toString()).to.equal("0");
    });

    it("should add 1 to the validator array of the poll struct", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.validatorsCount.toString()).to.equal("1");
    });
    it("should call setValidation after 3 votes and set status to validated", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER1,
      });
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER2,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER3,
      });
      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.status.toString()).to.equal("2");
    });
    it("should call setValidation after 2 validations and set status to validated", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });

      const poll = await DPollPluginValidatorInstance.pollSubmissions(0);
      expect(poll.status.toString()).to.equal("2");
    });
    it("should revert if a non member try to call setValidation", async () => {
      await expectRevert(
        DPollPluginValidatorInstance.setValidation(0, { from: STRANGER }),
        "You are not a member"
      );
    });
    it("should revert if we try to validate an inexistant poll", async () => {
      await expectRevert(
        DPollPluginValidatorInstance.setValidation(1, { from: MEMBER1 }),
        "The poll does not exist"
      );
    });
    it("should after 2 validation emit event PollStatusChange", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
      await expectEvent(tx, "PollStatusChange", {
        pollAddress: pollAddress,
        newStatus: "2",
        message: "Poll validated",
      });
    });
    it("should after 3 rejection emit event PollStatusChange", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER1,
      });
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER3,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER2,
      });
      await expectEvent(tx, "PollStatusChange", {
        pollAddress: pollAddress,
        newStatus: "2",
        message: "Poll validated",
      });
    });
    it("should increase the DAO balance after 2 validations", async () => {
      const daoBalanceBefore = await web3.eth.getBalance(DPollDAOAddress);
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
      const daoBalanceAfter = await web3.eth.getBalance(DPollDAOAddress);
      //expect before to be inferior to after
      expect(daoBalanceBefore).to.be.bignumber.lt(daoBalanceAfter);
    });
    it("should not increase the DAO balance after 3 rejections more than validator fees", async () => {
      const daoBalanceBefore = await web3.eth.getBalance(DPollDAOAddress);
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER1,
      });
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER2,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER3,
      });
      const daoBalanceAfter = await web3.eth.getBalance(DPollDAOAddress);

      //delta after - before should be = 5010000000000000
      const delta = daoBalanceAfter - daoBalanceBefore;
      //expect before to be equal to after
      expect(delta.toString()).to.equal("5010000000000000");
    });
    it("should increase the rewarsBalance of a validator DAO member after 2 validations", async () => {
      let membStruct = await DPollDAOInstance.getMember(MEMBER1);
      const memberRewardsBalanceBefore = membStruct.rewardsBalance;
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
      membStruct = await DPollDAOInstance.getMember(MEMBER1);
      const memberRewardsAfter = membStruct.rewardsBalance;
      //expect before to be inferior to after
      expect(memberRewardsBalanceBefore).to.be.bignumber.lt(memberRewardsAfter);
    });
    it("should set the poll status to starting (4) after 2 validation", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
      const poll = await pollInstance.getPollStatus();
      expect(poll.toString()).to.equal("4");
    });
    it("should set the poll status to ended (5) after 3 rejections", async () => {
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER1,
      });
      await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER3,
      });
      const tx = await DPollPluginValidatorInstance.voteForPoll(0, false, {
        from: MEMBER2,
      });
      const poll = await pollInstance.getPollStatus();
      expect(poll.toString()).to.equal("5");
    });
  });
});
