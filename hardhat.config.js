require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")

// hardhat-deply is a hardhat plugin to deploy contracts to any network, keeping track of them and replicating the same environment for testing (yarn add --dev hardhat-deploy) or yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers if we use ethers (which is the case). TNat will allow ethers to keep contract of all the different deplyoments we do in our contract
require("hardhat-deploy")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
    // DEFINE A COMPILER OBJECT IF YOU NEED TO USE SEVERAL VERSION OF SOLIDITY, FOR YOUR MOCK CONTRACT FOR INSTANCE
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainID: 5,
            blockConfirmations: 6,
        },
    },
    gasReporter: {
        enabled: true,
        output: "gas-report.txt", // output  the gas report when you run the test to a specific file. ADD IT TO .GITIGNORE
        noColors: true, // styling
        currency: "USD", // get the report in USD, retrieving quotation from COINMARKETCAP API (below)
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
