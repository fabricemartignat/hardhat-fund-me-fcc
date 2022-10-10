// USE OF THE HARDHAT-DEPLOY PLUGIN
//No main functiom with hardhat deploy

const { network } = require("hardhat")

// import the networkconfig object to get the eth/usd address from helpers-hardhat-config

const { networkConfig, developmentChains } = require("../helper-hardhat-config")

// import the verify function in the utils folder
const { verify } = require("../utils/verify")

// Instead export of an anonimous async function with the hardhat runtime environment (hre) as parameter

module.exports = async (hre) => {
    // extract methods we need from the hre object (eq to hre.getNameAccounts() for instance)
    const { getNamedAccounts, deployments } = hre

    // extract methods we need from the deployments object
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // getti the address of the Eth/USd contract for all networks parametered in networkConfig (helper-hardhat-config). When you type yarn hardhat deploy --network NETWORK, it will automatically retrieve the chainId and the address vir the name of the network

    let ethUsdPriceFeedAddress

    // if the name of the network is not in the developmentChains list, i.e. you deploy on the local network or hardaht, then the sddress is the address of the eht/usd contract is the address of the Mock contract, MMOCKV3AGGREGATOR, otherwise it is the address of the eth/usd contract you are deploying on
    if (developmentChains.includes(network.name)) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator") // get the details the MockV3Aggregator  conttract
        ethUsdPriceFeedAddress = ethUSDAggregator.address // assing the address to the Mock contract
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
        // ethUsdPriceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }

    // what happens when we want to change chainlinks?
    // when going for localhost or hardhat network (default), we want to use a mock (file OO-deploy-mocks) and deploy a minimal versio of the contract. The reason beinig in this case that the hardhat network doesn't have a pricefeedAdress to get the ETH/USD.

    // DEPLOY CONTRACT
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // VERIFY CONTTRACT

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, ethUsdPriceFeedAddress)
    }

    log("-------------------------------------------------")
}

//Assign some tags to the script so that you can deploy this one specifically (yarn hardhat deploy --tags +tag name)
module.exports.tags = ["all", "fundme"]
