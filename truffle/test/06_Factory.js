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
contract("TEST_06/PollFactory", (accounts) => {
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
  let DPollPluginProposalsAddress;
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
  const DAOentryFees = web3.utils.toWei("0.02", "ether");
  const minPollCost = web3.utils.toWei("0.05", "ether");
  const minCostPerResponse = web3.utils.toWei("0.0001", "ether");
  const pollCost1 = web3.utils.toWei("0.051", "ether"); //plus additonal cost per response
  const pollCost2 = web3.utils.toWei("0.051", "ether");
  const insufficientPollFund = web3.utils.toWei("0.05", "ether");

  describe("PollFactory deployment", () => {
    //change to beforeEach to be cleaner => test ok but not as it should be
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
      // await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, { from: ADMIN });
    });
    it("should deploy a Certifier contract", async () => {
      certifierInstance = await Certifier.new({ from: ADMIN });
      certifierAddress = certifierInstance.address;
      assert.equal(certifierAddress.length, 42);
    });
    it("should deploy a PollFactory contract", async () => {
      certifierInstance = await Certifier.new({ from: ADMIN });
      certifierAddress = certifierInstance.address;

      pollFactoryInstance = await PollFactory.new(
        DPollDAOAddress,
        certifierAddress,
        DPollPluginValidatorAddress,
        { from: ADMIN }
      );
      pollFactoryAddress = pollFactoryInstance.address;
      assert.equal(pollFactoryAddress.length, 42);
    });
    it("should deploy a PollMaster contract", async () => {
      certifierInstance = await Certifier.new({ from: ADMIN });
      certifierAddress = certifierInstance.address;

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
      assert.equal(pollMasterAddress.length, 42);
    });
    it("should set PollMaster address in PollFactory", async () => {
      certifierInstance = await Certifier.new({ from: ADMIN });
      certifierAddress = certifierInstance.address;

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
      await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        from: ADMIN,
      });
      const pollMasterAddressFromPollFactory =
        await pollFactoryInstance.getMasterPollAddress();
      expect(pollMasterAddressFromPollFactory).to.equal(pollMasterAddress);
    });
    it("should set PluginValidator address in PollFactory", async () => {
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
      await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        from: ADMIN,
      });
      const pollMasterAddressFromPollFactory =
        await pollFactoryInstance.getMasterPollAddress();
      // expect(pollMasterAddressFromPollFactory).to.equal(pollMasterAddress);
      const validatorSet =
        await pollFactoryInstance.DPollPluginValidatorAddress();
      expect(validatorSet).to.equal(DPollPluginValidatorAddress);
    });

    //test it add du plugin validator!!!!!!!!!!!
    describe("accessibility of PollFactory functions", () => {
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
        // await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, { from: ADMIN });
      });
      it("should revert when a non-admin try to set PollMaster address in PollFactory", async () => {
        await expectRevert(
          pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
            from: STRANGER,
          }),
          "Ownable: caller is not the owner"
        );
      });
      //ADMIN set pollMaster address in pollFactory and MEMBER1 become member of DAO
      //MEMBER1 should access to createPollContract function
      //STRANGER should not access to createPollContract function
      //arg for poll creation used : pollCreationArgs1
      it("should let MEMBER1 (new DAO member) create a poll contract", async () => {
        await mockAddMember(DPollDAOInstance, [MEMBER1], DAOentryFees);
        await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
          from: ADMIN,
        });
        const tx = await pollFactoryInstance.createPollContract(
          pollCreationArgs1.responsesCount,
          pollCreationArgs1.name,
          pollCreationArgs1.description,
          pollCreationArgs1.criteria,
          { from: MEMBER1, value: pollCost1 }
        );
        // pollAddress = tx.logs[0].args.pollAddress;
        // pollInstance = await PollMaster.at(pollAddress);
        // const pollOwner = await pollInstance.owner();
        // expect(pollOwner).to.equal(MEMBER1);
        const pollAddresessFromFactory =
          await pollFactoryInstance.getPollClonesAddresses();
        const newPollAddress = pollAddresessFromFactory[0];
        expect(newPollAddress.length).to.equal(42);
      });
      //member1 create 2 polls member2 is added to DAO and create 1 poll
      //it should returns a array of 3 addresses + 1 (the previous one created)
      it("should return an array of 3 addresses (1 previous poll, 2 new from member1, one new from member2", async () => {
        await mockAddMember(DPollDAOInstance, [MEMBER2], DAOentryFees);
        // await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        //     from: ADMIN,
        // });
        await pollFactoryInstance.createPollContract(
          pollCreationArgs1.responsesCount,
          pollCreationArgs1.name,
          pollCreationArgs1.description,
          pollCreationArgs1.criteria,
          { from: MEMBER1, value: pollCost1 }
        );
        await pollFactoryInstance.createPollContract(
          pollCreationArgs1.responsesCount,
          pollCreationArgs1.name,
          pollCreationArgs1.description,
          pollCreationArgs1.criteria,
          { from: MEMBER1, value: pollCost1 }
        );
        await pollFactoryInstance.createPollContract(
          pollCreationArgs1.responsesCount,
          pollCreationArgs1.name,
          pollCreationArgs1.description,
          pollCreationArgs1.criteria,
          { from: MEMBER2, value: pollCost1 }
        );
        const pollAddresessFromFactory =
          await pollFactoryInstance.getPollClonesAddresses();
        expect(pollAddresessFromFactory.length).to.equal(4);
      });
      it("should revert when STRANGER try to create a poll contract", async () => {
        //skip as 'before' hook not beforeEach
        // await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        //   from: ADMIN,
        // });
        await expectRevert(
          pollFactoryInstance.createPollContract(
            pollCreationArgs1.responsesCount,
            pollCreationArgs1.name,
            pollCreationArgs1.description,
            pollCreationArgs1.criteria,
            { from: STRANGER, value: pollCost1 }
          ),
          "You are not a member"
        );
      });
      it("should revert if MEMBER1 try to create a poll contract with insufficient fund", async () => {
        //skip as 'before' hook not beforeEach
        // await pollFactoryInstance.setPollMasterAddress(pollMasterAddress, {
        //   from: ADMIN,
        // });
        await expectRevert(
          pollFactoryInstance.createPollContract(
            pollCreationArgs1.responsesCount,
            pollCreationArgs1.name,
            pollCreationArgs1.description,
            pollCreationArgs1.criteria,
            { from: MEMBER1, value: insufficientPollFund }
          ),
          "Funds inferior to poll minimum cost"
        );
      });
    });
  });
});
