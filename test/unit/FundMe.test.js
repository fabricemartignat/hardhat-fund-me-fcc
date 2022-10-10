// test the FundMe funnctions and features

const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

// ternary operator to test if we are on the local network (hardhat or localhost). If we are not, we skip the test, otherwise we run describe()
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let MockV3Agrregator
          const sendValue = ethers.utils.parseEther("1") // 1 ETH in wei instead of writing 1000000000000000000

          beforeEach(async function () {
              // deploy the fundME contract
              // using Hardhat deploy

              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // fixture allows to deploy all the contracts with the specified tag ("all in this example")
              //Once contracts are deployed

              fundMe = await ethers.getContract("FundMe", deployer) // get the last FundMe contract deployed from the specified deployer
              MockV3Agrregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          // test the constrcutor
          describe("constructor", function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.s_priceFeed()

                  assert.equal(response, MockV3Agrregator.address)
              })
          })

          // test the fund function

          describe("fund", function () {
              // test to see if it fails if you donlt send enough ETH
              it("fails if you don't send enough ETH", async function () {
                  // use of the REVERT feature in WAFFLE to test if the function is reverted if we dont'send enough ETH (no paremeter in fundMe.fund()-IMPORT EXPECT FROM CHAI
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH"
                  )
              })

              // test if the amiunt you send is refelcted in the mapping object

              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              // test if the funded is added to the list of s_funders
              it("Adds funder to the list of s_funders", async function () {
                  await fundMe.fund({ value: sendValue }) //deployer sends fund
                  const response = await fundMe.s_funders(0) // deployer SHOULD be in the s_funders list (index 0)
                  assert.equal(response, deployer) // check that the first in the s_funders list is the deployer
              })
          })

          // test the withdraw function
          describe("withdraw", function () {
              // add funds first to check if you can withdraw it
              // used beforeEach() to do it once for all the test instead of each time in the it() test

              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue }) // add funds
              })

              it("withdraw ETH from a single funder", async function () {
                  //Arrange
                  //Act
                  //Assert

                  //Arrange
                  // get the balance of the fund me and the deployer
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act

                  // withdraw fund and wait for the transaction

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  // getting the  gas cost as we will need it later in the test
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // extract objects from the transactionReceipt object

                  const gasCost = gasUsed.mul(effectiveGasPrice) //use of th multiple funtion as these are big numbers

                  // get the balance after withdraw

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // check that the contract balance is 0 after all is withdrawn

                  assert.equal(endingFundMeBalance, 0)

                  // check that all the funds moved in anf out of the contract + THE GAS COST (it costs a  bit of gas to th deployer) = the deplyer balance after withdrawal to make sure no fund had leaked
                  // use of .add instead of + and toString() as we are manipulating big numbers

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              // testing wiht multiple s_funders

              it("allows us to withdraw with mutliple funder", async function () {
                  //Arrange

                  const accounts = await ethers.getSigners() // get a list of accounts in the node

                  // for each of the account, run the fund() function. You start at index 1 as index 0 is the deployer

                  for (let i = 1; i < accounts.length; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      ) // connect the accout to the contract
                      await fundMeConnectedContract.fund({ value: sendValue }) // send maney from the account to the contract
                  }

                  // get the balance of the fundMe contract and of the s_funders
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //ACT-withdrawing funds

                  const transactionResponse = await fundMe.withdraw()

                  const transactionReceipt = await transactionResponse.wait(1)

                  // getting the  gas cost as we will need it later in the test
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // extract objects from the transactionReceipt object

                  const gasCost = gasUsed.mul(effectiveGasPrice) //use of th multiple funtion as these are big numbers

                  //ASSERT

                  // get the balance after withdraw

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // check that the contract balance is 0 after all is withdrawn

                  assert.equal(endingFundMeBalance, 0)

                  // check that all the funds moved in anf out of the contract + THE GAS COST (it costs a  bit of gas to th deployer) = the deplyer balance after withdrawal to make sure no fund had leaked
                  // use of .add instead of + and toString() as we are manipulating big numbers

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure that the s_funders array is reset properly

                  await expect(fundMe.s_funders(0)).to.be.reverted /// check that there is ni funder left (fundMe is reverted)

                  //check that all the s_funders balance is 0

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              // test of the only i_owner modifier-only the i_owner of the funds can withdraw

              it("only allows the i_owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()

                  const attacker = accounts[1]

                  const attackerConnectedContracts = await fundMe.connect(
                      attacker
                  )

                  await expect(attackerConnectedContracts.withdraw()).to.be
                      .reverted //the attacket should not be able to withdraw as it has not funded the contract
              })

              // Test the cheaper witdraw function

              it("cheaperWitraw testing..", async function () {
                  //Arrange

                  const accounts = await ethers.getSigners() // get a list of accounts in the node

                  // for each of the account, run the fund() function. You start at index 1 as index 0 is the deployer

                  for (let i = 1; i < accounts.length; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      ) // connect the accout to the contract
                      await fundMeConnectedContract.fund({ value: sendValue }) // send maney from the account to the contract
                  }

                  // get the balance of the fundMe contract and of the s_funders
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //ACT-withdrawing funds

                  const transactionResponse = await fundMe.cheaperWithdraw()

                  const transactionReceipt = await transactionResponse.wait(1)

                  // getting the  gas cost as we will need it later in the test
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // extract objects from the transactionReceipt object

                  const gasCost = gasUsed.mul(effectiveGasPrice) //use of th multiple funtion as these are big numbers

                  //ASSERT

                  // get the balance after withdraw

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // check that the contract balance is 0 after all is withdrawn

                  assert.equal(endingFundMeBalance, 0)

                  // check that all the funds moved in anf out of the contract + THE GAS COST (it costs a  bit of gas to th deployer) = the deplyer balance after withdrawal to make sure no fund had leaked
                  // use of .add instead of + and toString() as we are manipulating big numbers

                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // Make sure that the s_s_funders array is reset properly

                  await expect(fundMe.s_funders(0)).to.be.reverted /// check that there is ni funder left (fundMe is reverted)

                  //check that all the s_funders balance is 0

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
