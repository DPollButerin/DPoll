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
contract("TEST_10/WORKFLOW => Answering the poll", (accounts) => {
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
      //submission
      tx = await pollInstance.submitPoll({ from: MEMBER1 });

      //validation
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER1,
      });
      await DPollPluginValidatorInstance.voteForPoll(0, true, {
        from: MEMBER2,
      });
    });
    it("should let someone answer to the poll ", async () => {
      //trnasfo "i'm eligible" in bytes32
      const eligibility = web3.utils.soliditySha3(
        web3.utils.encodePacked({ type: "string", value: "i'm eligible" })
      );

      await pollInstance.addAnswer([0, 2], eligibility, {
        from: MEMBER1,
      });
      const poll = await pollInstance.getRespondentsCount();
      expect(poll.toString()).to.equal("1");
    });
    it("should revert if someone try to answer to the poll twice", async () => {
      //trnasfo "i'm eligible" in bytes32
      const eligibility = web3.utils.soliditySha3(
        web3.utils.encodePacked({ type: "string", value: "i'm eligible" })
      );

      await pollInstance.addAnswer([0, 2], eligibility, { from: MEMBER1 });
      await expectRevert(
        pollInstance.addAnswer([0, 2], eligibility, { from: MEMBER1 }),
        "Already answered"
      );
    });
    it("should revert if we answer an non existing question", async () => {
      //trnasfo "i'm eligible" in bytes32
      const eligibility = web3.utils.soliditySha3(
        web3.utils.encodePacked({ type: "string", value: "i'm eligible" })
      );

      await expectRevert(
        pollInstance.addAnswer([0, 2, 5, 6, 7, 8], eligibility, {
          from: MEMBER1,
        }),
        "Wrong number of answers"
      );
    });
  });
});
