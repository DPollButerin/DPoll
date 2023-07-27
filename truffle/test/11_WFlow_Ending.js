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
contract("TEST_11/WORKFLOW => Ending the poll", (accounts) => {
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

  describe("Owner stop the poll", () => {
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
        { from: MEMBER1, value: pollCost2 }
      );

      pollAddress = tx.logs[1].args.newPollContract;
      pollInstance = await PollMaster.at(pollAddress);
      //fill the poll

      tx = await pollInstance.addTopicsBatch(questions, answers, {
        from: MEMBER1,
      });
      //submission
      tx = await pollInstance.submitPoll({ from: MEMBER1 });

      //validation
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
      //cost1 only one response paid (sinon nto enough fund vu que pas payé pour mini de 2 responses)
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER3,
      });
      const eligibility = web3.utils.soliditySha3(
        web3.utils.encodePacked({ type: "string", value: "i'm eligible" })
      );

      //answer the poll
      //   await pollInstance.addAnswer([0, 2], eligibility, {
      //     from: MEMBER1,
      //   });

      await pollInstance.addAnswer([1, 2], eligibility, {
        from: MEMBER2,
      });
    });

    it("should let owner end the poll", async () => {
      await pollInstance.endPoll({ from: MEMBER1 });
      const pollStatus = await pollInstance.getPollStatus();
      expect(pollStatus.toString()).to.equal("5");
    });
    it("sould revert if non owner try to end the poll", async () => {
      await expectRevert(
        pollInstance.endPoll({ from: STRANGER }),
        "Ownable: caller is not the owner"
      );
    });
    it("should le owner get answers after ending the poll", async () => {
      await pollInstance.endPoll({ from: MEMBER1 });
      const answers = await pollInstance.getUnpackedAnswers({ from: MEMBER1 });
      expect(answers[0][0].toString()).to.equal("0");
      expect(answers[0][1].toString()).to.equal("2");
    });
    it("should have the good number of respondents after ending the poll", async () => {
      await pollInstance.endPoll({ from: MEMBER1 });
      const answers = await pollInstance.getPackedAnswers({ from: MEMBER1 });
      expect(answers.length).to.equal("1");
    });
    it("should have the good number of answers after ending the poll", async () => {
      await pollInstance.endPoll({ from: MEMBER1 });
      const answers = await pollInstance.getUnpackedAnswers({ from: MEMBER1 });
      expect(answers[0].length).to.equal("2");
    });
  });
});
