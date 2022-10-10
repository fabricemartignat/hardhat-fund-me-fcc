// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

// THE BELOW COMMENT SHOWS HOW YOU SHOULD COMMENT IN SOLIDITY USING NATSPEC-IT WILL ALLOW YOU TO CREATE A DOC MUCH MORE EASILY

/** @title A contract for crowd fundding
 * @author Fabrice
 * @notice This contract is a demo of a funding contract
 * @dev This implement price feed as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    // AVANCED SECTION: GAS OPTIMIZATION
    // Variables outside of a function (local scope)  or not constant, memory or immutable are stored in storage array so that they persist. WRITTING OR RETRIEVING FROM STORAGE CONSUMES A LOT OF GAS. STORE COST 20000 GAS AND LOAD 800 COMPARED TO JUST 3 FOR ADDING.
    // In General, each opcode (add, mutl, getbalance, storage ...) consumes gas.
    // https://ethereum.org/en/developers/docs/evm/opcodes/

    // Reading and writting in memory os cheaper. Mappings can't be in memory
    // Private and Internal variables are cheaper than Public variables

    // You add a s_ in front of the variable to identify it as a STORAGE variable
    // You add a i_ in front of the variable to identify it as a IMMUTABLE variable
    // You CAPITALUZE  constant variable
    // IT ENABLES YOU JUST BY READING YOUR CODE TO IDENTIFY THE FUNCTION THAT CONSUMES A LOT OF GAS-IN THIS CONTRACT IT IS THE WITDRAW() FUNCTION, ESPECIALLY THE FOR LOOP. THE OBJECTIVE IS TO CREATE A CHEAPER WITHDRAW FUNCTION.

    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    //from the @chainlink import
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /** @notice this fucntion funds this contract
     * @dev This implement price feed as our library
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // CHEAPER WITHDRAW() FUNCTION

    function cheaperWithdraw() public payable onlyOwner {
        // Reading and writting in memory. Create a funder array in memory from s_funders to use it in your for loop.

        address[] memory funders = s_funders;

        //mappings can't be in memory

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \
    //         yes  no
    //         /     \
    //    receive()?  fallback()
    //     /   \
    //   yes   no
    //  /        \
    //receive()  fallback()
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
