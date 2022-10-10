//DEFINING THE ADDRESS OF THE CONTRACT DEPENDING ON THE NETWORK YOU WANT TO DEPLOY ON

// You create an object witht the chainId of the networs as key and the info (name, address) as value.

const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },

    137: {
        name: "polygon",
        ethUsdPriceFeed: 0xf9680d99d6c9589e2a93a78a04a279e509205945,
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

// you export to use it in deploy
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
