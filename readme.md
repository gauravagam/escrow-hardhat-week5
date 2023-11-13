# Decentralized Escrow Application

This is an Simple Escrow Dapp. In this dapp, I have implemented only the approve and cancel functionalities. I have integrated the Metamask wallet for this application.
As a depositor, anyone can provide the arbiter, beneficiary and amount to deploy the contract. The list of all deployed contracts is displayed.
The options to approve and cancel are shown only if the arbiter is logged in using Metamask.

## Project Layout

There are three top-level folders:

1. `/app` - contains the front-end application
2. `/contracts` - contains the solidity contract
3. `/tests` - contains tests for the solidity contract

## Setup

Install dependencies in the top-level directory with `npm install`.

After you have installed hardhat locally, you can use commands to test and compile the contracts, among other things. To learn more about these commands run `npx hardhat help`.

Compile the contracts using `npx hardhat compile`. The artifacts will be placed in the `/app` folder, which will make it available to the front-end. This path configuration can be found in the `hardhat.config.js` file.

Then start the local blockchain using `npx hardhat node`.

## Front-End

`cd` into the `/app` directory and run `npm install`

To run the front-end application run `npm start` from the `/app` directory. Open [http://localhost:3002](http://localhost:3002) to view it in your browser.

## Server

In the root folder of project you can find the server.js file. Run `npm start` to start the server. In this file I have maintained one array which will contain all the deployed escrow smart contract info object.

Apis list :
1. getEscrowContracts - gives the list of all deployed smart contract
2. saveEscrowContract - saves the single smart contract information object in smart contract list array
3. updateContract - update the approved and cancel flag in specific smart contract based on contract address

