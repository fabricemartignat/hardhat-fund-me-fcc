// Deploy mocks, i.e. deploying a minimal contract for testing in case we can't have access to a data vis the network we use (local netwrok in that case)

// import developmentChain from helper-harhat-config.js
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async (hre) => {
    // extract methods we need from the hre object (eq to hre.getNameAccounts() for instance)
    const { getNamedAccounts, deployments } = hre

    // extract methods we need from the deployments object
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // these are the parameters of the mock contract in chainlink, imported from the helper-hardhat-config. You cand find the mock contract in node_modules> @chainlink>src> the mock contract you imported or in the chainlink github repo
        })
        log("Mocks deployed")
        log("------------------------------------")
    }
}

//Assign some tags to the script so that you can deploy this one specifically (yarn hardhat deploy --tags +tag name)
module.exports.tags = ["all", "mocks"]
