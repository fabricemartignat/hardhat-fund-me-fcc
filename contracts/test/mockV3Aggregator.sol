// Mock pricefeed aggregator to work on local network-in a separate test folder in the contracts folder

// THE PURPOSE IS TO GENERATE A FAKE PRICEFEED

// WE CAN SIMPLY IMPORT THE CONTRACT FROM THE CHAINLINK GITHUB REPO

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
