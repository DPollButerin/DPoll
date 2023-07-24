# D-Poll Dapp

- Context : This is the final project of the [Alyra blockchain developer](https://www.alyra.fr/) in preparation for certification. a team with two consultants was made and after project development the dev had two weeks to code the dapp
- Team : Igor Bournazel (dev), Maël Lecomte and Lucas Dernoncourt (consultants)
- Project : It is a dapp to create decentralized surveys remunerating respondents and lowering the probes' costs. DAO oversees the operation of survey creation with a reward system encouraging the proper functioning of the whole

## LINKS

- Goerli addresses :
- dapp link :
- demo video :
- team projects :
  - dev : _https://github.com/orgs/DPollButerin/projects/1/views/1_
  - consultants : _https://github.com/orgs/DPollButerin/projects/5/views/1_

## Technologies used

- blockchain side : truffle react box / web3js
- front side : react / chakra-ui
- deployment : goerli (testnet) / vercel

## Structure of the contracts

_(see comments in files for more explanations)_

### DAO

- DPollDAO is the master contract inheriting from DPollMember and DPollStorage (it manages : membership and funds/rewards)
- DPollPluginProposals is the plugin allowing to manage proposals and their executions of the DAO
- DPollPluginValidator manages the submission and validation of poll created (see comments in files)

### POLLS

- PollMaster is the master contract inheriting from PollAdmin, PollUser, PollHelpers, PollStorage
- PollFactory manages the creation of clone of PollMaster. The clones are the polls.
- The choice of clone is made cause it's the cheaper contracts. They allow to keep only memory context using logic via proxy

### Interfaces

many interfaces are here to interact with smart contract by isolating accessible functionalities (admin of poll, user of poll, validator...)

## Structure of the UI

- APP contains the main routes leading to layout of sections. These layout contain the secondary nav.
- 1 provider is used for the metamask connection
- 1 provider is used to manage abi, addresses... of the contract
- 1 provider is used to manage transactions and associated events.

## UNIT TEST

- the design of the tests was done first by order then by accessibility then by workflow
- So first the helpers and internal functions are protected (via an inheritance contract used only for tests)
- Then contracts deployment and settings was test
- After it follows the order of usage : DAO, Factory, Clone, workflow of the poll (PollMaster as a proxy)...

- Each function is test for each constraints (revert cases) and regular case

- All tests are not done yet.

## SETUP TO RUN in local environment:

- node 16.16.0 was used for the developpement, and this truffle box use web3js version 1
- clone the project
- 1 terminal : ganache to launch the private blockain
- 1 terminal : truffle migrate to deploy the contracts
- 1 terminal : npm run start to launch the dapp on localhost:8080
