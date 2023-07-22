const { assert, expect } = require("chai");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { inTransaction } = require("@openzeppelin/test-helpers/src/expectEvent");
// import web3 from "web3";
const TestPollHelper = artifacts.require("TestPollHelper");
const PollView = artifacts.require("PollView");
const PollHelpers = artifacts.require("PollHelpers");

/*
These tests will test internals functions of Poll contract (in PollView, PollHelpers)
TestPollHelper is a contract that inherit from PollUser and so from PollView and PollHelpers. It's only used for testing purpose and is not deployed on the blockchain
*/

contract("TestPollHelper", (accounts) => {
  // const [ADMIN, USER1, USER2, USER3] = accounts;
  // const criteria = "TEST";
  // const target = USER1;
  // //subject: 'keccak256(abi.encodePacked(target, criteria))'
  // const subject = web3.utils.soliditySha3(
  //   web3.utils.encodePacked(
  //     { type: "address", value: target },
  //     { type: "string", value: criteria }
  //   )
  // );
  // const proof = web3.utils.soliditySha3("I claim this address is certified");
  // const method = web3.utils.soliditySha3("fake method");
  // let testPollHelperInstance;
  // before(async () => {
  //   testPollHelperInstance = await TestPollHelper.new({ from: ADMIN });
  // });
  // describe("contract : PollView (getters)", () => {
  //   const mockedTimestamp = () => Math.floor(Date.now() / 1000); // Date.now() returns milliseconds, so divide by 1000 to get seconds
  //   const mockedRequiredResponseCount = 150;
  //   const mockedRespondentsCount = 100;
  //   const mockedPollName = "TEST NAME";
  //   const mockedPollDescription = "TEST DESCRIPTION";
  //   const mockedBalance = new BN(1000000000000); //10 * 10 ** 18); -6 0
  //   const mockedAmountToRespondent = new BN(10000000000); //(1 * 10 ** 16);
  //   const mockedAmountToDao = new BN(100000000000); //1 * 10 ** 18);
  //   const mockedAmountToValidators = new BN(1000000000000); //1 * 10 ** 18);
  //   const mockedPollStatus = 3; // [0 - 5]
  //   const mockedIsCanceled = true;
  //   const mockedQuestion = "TEST QUESTION";
  //   const mockedChoices = ["CHOICE 1", "CHOICE 2", "CHOICE 3"];
  //   const mockedTopic = {
  //     firstChoiceIndex: 0,
  //     question: mockedQuestion,
  //     choices: mockedChoices,
  //   };
  //   const mockedTopicsLength = 3;
  //   const mockedTopics = [
  //     { ...mockedTopic, firstChoiceIndex: 0 },
  //     { ...mockedTopic, firstChoiceIndex: 3 },
  //     { ...mockedTopic, firstChoiceIndex: 6 },
  //   ];
  //   const mockedQuestionOfTopics = [
  //     "TEST QUESTION 1",
  //     "TEST QUESTION 2",
  //     "TEST QUESTION 3",
  //   ];
  //   const mockedChoicesOfTopics = [
  //     "TOPIC 1 CHOICE 1",
  //     "TOPIC 1 CHOICE 2",
  //     "TOPIC 2 CHOICE 1",
  //     "TOPIC 2 CHOICE 2",
  //     "TOPIC 3 CHOICE 1",
  //     "TOPIC 3 CHOICE 2",
  //     "TOPIC 3 CHOICE 3",
  //   ];
  //   const mockedChoicesPerTopic = [2, 2, 3];
  //   const mockedFirstIndexOfTopic = [0, 3, 5, 7];
  //   // it(`should return the timestamp : ${mockedTimestamp}`, async () => {
  //   //   await testPollHelperInstance.setTimestampLimit(mockedTimestamp());
  //   //   const timestamp = await testPollHelperInstance.getTimestampLimit();
  //   //   expect(timestamp).to.be.bignumber.equal(new BN(mockedTimestamp()));
  //   // });
  //   it(`should return the requiredResponseCount : ${mockedRequiredResponseCount}`, async () => {
  //     await testPollHelperInstance.setRequiredResponseCount(
  //       mockedRequiredResponseCount
  //     );
  //     const requiredResponseCount =
  //       await testPollHelperInstance.getRequiredResponseCount();
  //     expect(requiredResponseCount).to.be.bignumber.equal(
  //       new BN(mockedRequiredResponseCount)
  //     );
  //   });
  //   it(`should return the respondentsCount : ${mockedRespondentsCount}`, async () => {
  //     await testPollHelperInstance.setRespondentsCount(mockedRespondentsCount);
  //     const respondentsCount =
  //       await testPollHelperInstance.getRespondentsCount();
  //     expect(respondentsCount).to.be.bignumber.equal(
  //       new BN(mockedRespondentsCount)
  //     );
  //   });
  //   it(`should return the pollName : ${mockedPollName}`, async () => {
  //     await testPollHelperInstance.setPollInformations(
  //       mockedPollName,
  //       mockedPollDescription
  //     );
  //     const result = await testPollHelperInstance.getPollInformations();
  //     expect(result[0]).to.equal(mockedPollName);
  //   });
  //   it(`should return the pollDescription : ${mockedPollDescription}`, async () => {
  //     await testPollHelperInstance.setPollInformations(
  //       mockedPollName,
  //       mockedPollDescription
  //     );
  //     const result = await testPollHelperInstance.getPollInformations();
  //     expect(result[1]).to.equal(mockedPollDescription);
  //   });
  //   it(`should return the balance : ${mockedBalance}`, async () => {
  //     await testPollHelperInstance.setBalance(mockedBalance);
  //     const balance = await testPollHelperInstance.getBalance();
  //     expect(balance).to.be.bignumber.equal(mockedBalance);
  //   });
  //   it(`should return the amountToRespondent : ${mockedAmountToRespondent}`, async () => {
  //     await testPollHelperInstance.setAmountToRespondent(
  //       mockedAmountToRespondent
  //     );
  //     const amountToRespondent =
  //       await testPollHelperInstance.getAmountToRespondent();
  //     expect(amountToRespondent).to.be.bignumber.equal(
  //       mockedAmountToRespondent
  //     );
  //   });
  //   it(`should return the amountToDAO : ${mockedAmountToDao}`, async () => {
  //     await testPollHelperInstance.setAmountToDAO(mockedAmountToDao);
  //     const amountToDao = await testPollHelperInstance.getAmountToDAO();
  //     expect(amountToDao).to.be.bignumber.equal(mockedAmountToDao);
  //   });
  //   it(`should return the amountToValidators : ${mockedAmountToValidators}`, async () => {
  //     await testPollHelperInstance.setAmountToValidators(
  //       mockedAmountToValidators
  //     );
  //     const amountToValidators =
  //       await testPollHelperInstance.getAmountToValidators();
  //     expect(amountToValidators).to.be.bignumber.equal(
  //       mockedAmountToValidators
  //     );
  //   });
  //   it(`should return the pollStatus : ${mockedPollStatus}`, async () => {
  //     await testPollHelperInstance.setPollStatus(mockedPollStatus);
  //     const pollStatus = await testPollHelperInstance.getPollStatus();
  //     expect(pollStatus).to.be.bignumber.equal(new BN(mockedPollStatus));
  //   });
  //   it(`should return the isCanceled : ${mockedIsCanceled}`, async () => {
  //     await testPollHelperInstance.setIsCanceled(mockedIsCanceled);
  //     const isCanceled = await testPollHelperInstance.getIsCanceled();
  //     expect(isCanceled).to.equal(mockedIsCanceled);
  //   });
  //   it(`should return the topic : 0, mockedQuestion, mockedChoices`, async () => {
  //     await testPollHelperInstance.setTopic(mockedQuestion, mockedChoices);
  //     const result = await testPollHelperInstance.getTopic(0);
  //     expect(result[0]).to.be.bignumber.equal(new BN(0));
  //     expect(result[1]).to.equal(mockedQuestion);
  //     expect(result[2]).to.deep.equal(mockedChoices);
  //   });
  //   //DO HELPERS TO HAVE MOCKED ELEMENTS FOR TOPICS TO IRETATE OVER (with foreach)
  //   // describe("getTopics", async () => {
  //   //   let topics;
  //   //   before(async () => {
  //   //     await testPollHelperInstance.setTopics(
  //   //       mockedChoicesPerTopic,
  //   //       mockedQuestionOfTopics,
  //   //       mockedChoicesOfTopics
  //   //     );
  //   //   });
  //   //   describe("getTopics", async () => {
  //   //     topics.forEach(async (topic, index) => {
  //   //       topics = await testPollHelperInstance.getTopics();
  //   //       let firstChoice, question, choices;
  //   //       let expectedTopic;
  //   //       if (index > 0) {
  //   //         expectedTopic = mockedTopic;
  //   //       } else {
  //   //         expectedTopic = {
  //   //           firstChoiceIndex: mockedFirstIndexOfTopic[index],
  //   //           question: mockedQuestionOfTopics[index],
  //   //           choices: mockedChoicesOfTopics.slice(
  //   //             mockedFirstIndexOfTopic[index],
  //   //             mockedFirstIndexOfTopic[index] + mockedChoicesPerTopic[index]
  //   //           ),
  //   //         };
  //   //       }
  //   //       it(`should return the topic : ${index}, mockedQuestionOfTopics[index], mockedChoicesOfTopics[index]`, async () => {
  //   //         expect(topic.firstChoiceIndex).to.be.bignumber.equal(
  //   //           new BN(expectedTopic.firstChoiceIndex)
  //   //         );
  //   //         expect(topic.question).to.equal(expectedTopic.question);
  //   //         expect(topic.choices).to.deep.equal(expectedTopic.choices);
  //   //       });
  //   //     });
  //   //   });
  //   // });
  //   it(`should return the topics : mockedTopics}`, async () => {
  //     await testPollHelperInstance.setTopics(
  //       mockedChoicesPerTopic,
  //       mockedQuestionOfTopics,
  //       mockedChoicesOfTopics
  //     );
  //     const topics = await testPollHelperInstance.getTopics();
  //     console.log(topics);
  //     console.log("**************");
  //     console.log(topics[0]);
  //     console.log("**************");
  //     console.log(topics[1]);
  //     console.log("**************");
  //     console.log(topics[1][0]);
  //     console.log(topics[1][1]);
  //     console.log(topics[1][2]);
  //     expect(topics[0].firstChoiceIndex).to.be.bignumber.equal(new BN(0));
  //     expect(topics[1].firstChoiceIndex).to.be.bignumber.equal(new BN(3));
  //     expect(topics[1].question).to.equal(mockedQuestionOfTopics[0]);
  //     expect(topics[1].choices).to.deep.equal(
  //       mockedChoicesOfTopics.slice(0, 2)
  //     );
  //     expect(topics[2].firstChoiceIndex).to.be.bignumber.equal(new BN(5));
  //     expect(topics[2].question).to.equal(mockedQuestionOfTopics[1]);
  //     expect(topics[2].choices).to.deep.equal(
  //       mockedChoicesOfTopics.slice(2, 4)
  //     );
  //     expect(topics[3].firstChoiceIndex).to.be.bignumber.equal(new BN(7));
  //     expect(topics[3][1]).to.equal(mockedQuestionOfTopics[2]);
  //     expect(topics[3][2]).to.deep.equal(mockedChoicesOfTopics.slice(4, 7));
  //   });
  //   // it(`should return the topicsLength : ${mockedTopicsLength}`, async () => {
  //   //   await testPollHelperInstance.setTopics(mockedTopics);
  //   //   const topicsLength = await testPollHelperInstance.getTopicsLength();
  //   //   expect(topicsLength).to.be.bignumber.equal(new BN(mockedTopicsLength));
  //   // });
  // });
  // describe("contract : PollHelpers (bit operations)", () => {
  //   //example : uint:2290649224 => bin: 10001000100010001000100010001000 => set bits: [3,7,11,15,19,23,27,31]
  //   const mockedAnswerByBitFlagging = 2290649224;
  //   const mockedAnswerBitFormatBinary = "10001000100010001000100010001000";
  //   const mockedSetBitCount = 8;
  //   const mockedAnswerByChoiceIndex = [3, 7, 11, 15, 19, 23, 27, 31];
  //   // const mockedAnswerByChoiceIndexBN = [
  //   //   new BN(3),
  //   //   new BN(7),
  //   //   new BN(11),
  //   //   new BN(15),
  //   //   new BN(19),
  //   //   new BN(23),
  //   //   new BN(27),
  //   //   new BN(31),
  //   // ];
  //   it(`should return ${mockedAnswerByBitFlagging}, from : ${mockedAnswerByChoiceIndex}`, async () => {
  //     const answerBitFormatBinary =
  //       await testPollHelperInstance.testSetBitsFromPositions(
  //         mockedAnswerByChoiceIndex
  //       );
  //     console.log(answerBitFormatBinary);
  //     console.log(mockedAnswerBitFormatBinary);
  //     expect(answerBitFormatBinary).to.be.bignumber.equal(
  //       new BN(mockedAnswerByBitFlagging)
  //     );
  //     //equal(mockedAnswerByBitFlagging);
  //   });
  //   it(`should return ${mockedSetBitCount}, from : ${mockedAnswerByBitFlagging}`, async () => {
  //     const setBitCount = await testPollHelperInstance.testGetSetBitsCount(
  //       mockedAnswerByBitFlagging
  //     );
  //     expect(setBitCount).to.be.bignumber.equal(new BN(mockedSetBitCount));
  //   });
  //   it(`should return ${mockedAnswerByChoiceIndex}, from : ${mockedAnswerByBitFlagging}`, async () => {
  //     const answerByChoiceIndex =
  //       await testPollHelperInstance.testGetSetBitsPositions(
  //         mockedAnswerByBitFlagging
  //       );
  //     console.log(answerByChoiceIndex);
  //     console.log(mockedAnswerByChoiceIndex);
  //     //   expect(answerByChoiceIndex).to.deep.equal(mockedAnswerByChoiceIndex);
  //     expect(answerByChoiceIndex[0]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[0])
  //     );
  //     expect(answerByChoiceIndex[1]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[1])
  //     );
  //     expect(answerByChoiceIndex[2]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[2])
  //     );
  //     expect(answerByChoiceIndex[3]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[3])
  //     );
  //     expect(answerByChoiceIndex[4]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[4])
  //     );
  //     expect(answerByChoiceIndex[5]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[5])
  //     );
  //     expect(answerByChoiceIndex[6]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[6])
  //     );
  //     expect(answerByChoiceIndex[7]).to.be.bignumber.equal(
  //       new BN(mockedAnswerByChoiceIndex[7])
  //     );
  //   });
  // });
});
