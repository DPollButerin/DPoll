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
contract("TEST_07/PollMaster => clones", (accounts) => {
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
  const entryFees = web3.utils.toWei("0.02", "ether");
  const DAOentryFees = web3.utils.toWei("0.02", "ether");
  const minPollCost = web3.utils.toWei("0.05", "ether");
  const minCostPerResponse = web3.utils.toWei("0.0001", "ether");
  const pollCost1 = web3.utils.toWei("0.051", "ether"); //plus additonal cost per response
  const pollCost2 = web3.utils.toWei("0.051", "ether");
  const insufficientPollFund = web3.utils.toWei("0.05", "ether");

  describe("Poll clone creation", () => {
    const userList = [MEMBER1, MEMBER2, MEMBER3];
    before(async () => {
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
    });

    it("should create a clone of PollMaster for a member (1) and its address should be the last one in factory list", async () => {
      //create a poll
      const tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );
      //get poll address
      const pollAddresses = await pollFactoryInstance.getPollClonesAddresses();
      const pollAdd = tx.logs[1].args.newPollContract;
      expect(pollAddresses[0]).to.equal(pollAdd);
    });
    it("should set member 1 as admin of the poll when he create one", async () => {
      const tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );

      //   console.log("newPollAddress", newPollAddress);
      //   console.log("EXTRAIT ADDR du clone", newPollAddress.logs[0].args); //ownership
      //   console.log("EXTRAIT ADDR du clone", newPollAddress.logs[1].args); //pollcreated

      const pollAdd = tx.logs[1].args.newPollContract;
      const pollInstance = await PollMaster.at(pollAdd);
      //check that poll is owned by member 1
      assert.equal(await pollInstance.owner(), MEMBER1);
    });
    it("should have set the PluginValidator address in the clone", async () => {
      const tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );
      const pollAdd = tx.logs[1].args.newPollContract;
      const pollInstance = await PollMaster.at(pollAdd);
      const pluginValidatorAddress =
        await pollInstance.DPollPluginValidatorAddress();
      expect(pluginValidatorAddress).to.equal(DPollPluginValidatorAddress);
    });
    it("should have set the certifier address in the clone", async () => {
      const tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );
      const pollAdd = tx.logs[1].args.newPollContract;
      const pollInstance = await PollMaster.at(pollAdd);
      const certifierAddress = await pollInstance.certifierAddress();
      expect(certifierAddress).to.equal(certifierAddress);
    });
  });

  describe("Poll clone : add and get topic (infos, questions & answers)", () => {
    const userList = [MEMBER1, MEMBER2, MEMBER3];
    let pollInstance, pollAdd;
    before(async () => {
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

      //create a poll
      const tx = await pollFactoryInstance.createPollContract(
        pollCreationArgs1.responsesCount,
        pollCreationArgs1.name,
        pollCreationArgs1.description,
        pollCreationArgs1.criteria,
        { from: MEMBER1, value: pollCost1 }
      );

      pollAdd = tx.logs[1].args.newPollContract;
      pollInstance = await PollMaster.at(pollAdd);
      //check that poll is owned by member 1
    });
    it("should let MEMBER1 add a topic", async () => {
      const question = "TEST QUESTION";
      const answers = ["TEST ANSWER 1", "TEST ANSWER 2"];
      const tx = await pollInstance.addTopic(question, answers, {
        from: MEMBER1,
      });
      //check that topic has been added
      const topic = await pollInstance.getTopic(0);
      expect(topic.question).to.equal(question);
      expect(topic.choices[0]).to.equal(answers[0]);
      expect(topic.choices[1]).to.equal(answers[1]);
    });
    it("should get the topic added by MEMBER1 ", async () => {
      const question = "TEST QUESTION";
      const answers = ["TEST ANSWER 1", "TEST ANSWER 2"];
      const tx = await pollInstance.addTopic(question, answers, {
        from: MEMBER1,
      });
      //check that topic has been added
      const topic = await pollInstance.getTopic(0);
      // console.log("topic", topic);
      expect(topic.question).to.equal(question);
      expect(topic.choices[0]).to.equal(answers[0]);
      expect(topic.choices[1]).to.equal(answers[1]);
    });
    it("should get the number of topics added by MEMBER1 ", async () => {
      let question = "TEST QUESTION";
      let answers = ["TEST ANSWER 1", "TEST ANSWER 2"];
      let tx = await pollInstance.addTopic(question, answers, {
        from: MEMBER1,
      });
      question = "TEST QUESTION";
      answers = ["TEST ANSWER 1", "TEST ANSWER 2"];
      tx = await pollInstance.addTopic(question, answers, {
        from: MEMBER1,
      });
      //check that topic has been added
      const topicLength = await pollInstance.getTopicsLength();
      expect(topicLength.toString()).to.equal("4"); // 1 + 1 + 2 here => modify for beforeEach !!!!
    });
    it("should let member add topic per batch", async () => {
      let questions = ["TEST QUESTION BATCH 1", "TEST QUESTION BATCH 2"];
      let answers = [
        ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
        ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
      ];
      const tx = await pollInstance.addTopicsBatch(questions, answers, {
        from: MEMBER1,
      });
      //check that topic has been added
      const topicLength = await pollInstance.getTopicsLength();
      //get the last topic
      const topic = await pollInstance.getTopic(topicLength - 1);

      expect(topic.question).to.equal(questions[1]);
      expect(topic.choices[0]).to.equal(answers[1][0]);
      expect(topic.choices[1]).to.equal(answers[1][1]);
    });

    describe("Poll functions accessibility", () => {
      it("should revert if a non member try to add a topic", async () => {
        const question = "TEST QUESTION";
        const answers = ["TEST ANSWER 1", "TEST ANSWER 2"];
        await expectRevert(
          pollInstance.addTopic(question, answers, {
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if a non member try to add a topic per batch", async () => {
        let questions = ["TEST QUESTION BATCH 1", "TEST QUESTION BATCH 2"];
        let answers = [
          ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
          ["TEST ANSWER BATCH 1", "TEST ANSWER BATCH 2"],
        ];
        await expectRevert(
          pollInstance.addTopicsBatch(questions, answers, {
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if a non member try to call  getSelectedChoicesByAnswer", async () => {
        await expectRevert(
          pollInstance.getSelectedChoicesByAnswer(0, {
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if a non member try to call  getPackedAnswers", async () => {
        await expectRevert(
          pollInstance.getPackedAnswers({
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if a non member try to call getUnpackedAnswers  ", async () => {
        await expectRevert(
          pollInstance.getUnpackedAnswers({
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if a non member try to call submitPoll  ", async () => {
        await expectRevert(
          pollInstance.submitPoll({
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      it("should revert if non Validator address try to call setPollValidation  ", async () => {
        await expectRevert(
          pollInstance.setPollValidation(pollAdd, true, {
            from: STRANGER,
          }),
          "Only Validator can call this function"
        );
      });
      it("should revert if a non member try to call endPoll  ", async () => {
        await expectRevert(
          pollInstance.endPoll({
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
    });
  });
});
