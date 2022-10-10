//STAGING TESTS ARE TESTS BEFORE YOU DEPLOY TO A TESTNET (goerli)-LAST STAGE BEFORE GOING LIVE ON THE MAINNET-CODE VERY SIMILAR TO UNIT TESTS EXCEPT THAT WE RUN IT ON A TESTNET ONLY

// FUNDME.TEST WILL RUN IF WE ARE ON THE LOCAL NETWORK (yarn hardhat test --network hardhat)
// FUNDME.STAGING.TEST WILL RUN IF WE ARE ON THE TESTNET NETWORK (yarn hardhat test --network goerli)

const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")

const { developmentChains } = require("../../helper-hardhat-config")

// ternary operator to test if we are on the local network (hardhat or localhost). If we are, we skip the test, otherwise we run describe()
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )

              assert.equal(endingBalance.toString(), "0")
          })
      })
