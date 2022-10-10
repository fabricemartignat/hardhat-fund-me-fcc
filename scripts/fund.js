// SCRIPT  MAKES INTERACT WITH THE CONTRACT ON A LOCAL NODEv(yarn hardhat node) AND (yarn hardhat run sripts/name of the file.js --network name of the network) VERY QUICKLY

//BELOW IS THE SCRIPT FOR THE FUNDME() FUNCTION IN THE SMART CONTRACT

const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding Contract....")

    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })

    await transactionResponse.wait(1)

    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
