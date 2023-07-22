const TestPollHelper = artifacts.require("TestPollHelper");
const DPollDAO = artifacts.require("DPollDAO");
const DPollPluginValidator = artifacts.require("DPollPluginValidator");
const DPollPluginProposals = artifacts.require("DPollPluginProposals");
const DPollToken = artifacts.require("DPollToken");

const [adminId, userId1, usrId2, userId3, strangerId] = [0, 1, 2, 3, 4];
// const mockedQuestion = "TEST QUESTION";
// const getStringFromSize = (size) => {
//   let str = "";
//   for (let i = 0; i < size; i++) {
//     str += "A";
//   }
//   return str;
// };
// const getMockedChoices = (itemCount) => {
//   const choices = [];
//   for (let i = 0; i < itemCount; i++) {
//     choices.push(`CHOICE ${i + 1}`);
//   }
//   return choices;
// };
// const getMockedTopics = (topicCount, choicePerTopicArray) => {
//   if (topicCount !== choicePerTopicArray.length) {
//     throw new Error(
//       "topicCount and choicePerTopicArray must have the same length"
//     );
//   }
//   const topics = [];
//   const firstIndex = 0;
//   for (let i = 0; i < topicCount; i++) {
//     topics.push({
//       firstChoiceIndex: firstIndex,
//       question: `QUESTION ${i + 1}`,
//       choices: getMockedChoices(choicePerTopicArray[i]),
//     });
//     firstIndex += choicePerTopicArray[i];
//   }
//   return topics;
// };
// const getMockedQuestionsArray = (questionCount) => {
//   const questions = [];
//   for (let i = 0; i < questionCount; i++) {
//     questions.push(`QUESTION ${i + 1}`);
//   }
//   return questions;
// };
// const getMockedChoicesArray = (choiceCount, choicePerTopicArray) => {
//   const totalChoiceOfArray = choicePerTopicArray.reduce(
//     (acc, curr) => acc + curr,
//     0
//   );
//   if (choiceCount !== totalChoiceOfArray) {
//     throw new Error(
//       "choiceCount and choicePerTopicArray must have the same length"
//     );
//   }
//   const choices = [];
//   for (let i = 0; i < choicePerTopicArray.length; i++) {
//     for (let j = 0; j < choicePerTopicArray[i]; j++) {
//       choices.push(`CHOICE ${j + 1}`);
//     }
//   }
//   return choices;
// };

// const mockedChoices = ["CHOICE 1", "CHOICE 2", "CHOICE 3"];

module.exports = {
  adminId,
  userId1,
  usrId2,
  userId3,
  strangerId,
  mockAddMember: async (DPollDAOInstance, users, entryFees) => {
    for (let i = 0; i < users.length; i++) {
      await DPollDAOInstance.addMember(users[i], {
        from: users[i],
        value: entryFees,
      });
    }
    return DPollDAOInstance;
  },
  mockDAO: async (owner) => {
    const DPollDAOInstance = await DPollDAO.new({ from: owner });
    const DPollDAOaddress = await DPollDAOInstance.address;
    const DPollTokenAddress = await DPollDAOInstance.getDPTtokenAddress();
    const DPollTokenInstance = await DPollToken.at(DPollTokenAddress);
    return [DPollDAOInstance, DPollTokenInstance];
  },

  mockDAOandPlugins: async (owner) => {
    const DPollDAOInstance = await DPollDAO.new({ from: owner });
    const DPollDAOaddress = await DPollDAOInstance.address;
    const DPollTokenAddress = await DPollDAOInstance.getDPTtokenAddress();
    const DPollTokenInstance = await DPollToken.at(DPollTokenAddress);
    const DPollPluginValidatorInstance = await DPollPluginValidator.new(
      DPollDAOaddress,
      {
        from: owner,
      }
    );
    const DPollPluginProposalsInstance = await DPollPluginProposals.new(
      DPollDAOaddress,
      DPollTokenAddress,
      {
        from: owner,
      }
    );
    await DPollDAOInstance.setValidatorPluginAddress(
      DPollPluginValidatorInstance.address,
      {
        from: owner,
      }
    );
    await DPollDAOInstance.setProposalsPluginAddress(
      DPollPluginProposalsInstance.address,
      {
        from: owner,
      }
    );
    return [
      DPollDAOInstance,
      DPollPluginValidatorInstance,
      DPollPluginProposalsInstance,
      DPollTokenInstance,
    ];
  },
};

/*
test gas cost
  // Allow user1 to withdraw his funds
            const initialBalance = await ethers.provider.getBalance(user1)
            let response = await marketplace.connect(user1).withdrawFunds()
            let receipt = await response.wait()
            let usedGas = receipt.gasUsed
            let gasPriceInWei = response.gasPrice
            const newBalance = await ethers.provider.getBalance(user1)
           expect(newBalance).to.equal(initialBalance+ethers.parseEther(paidAmount.toString())-usedGas*gasPriceInWei)
*/
