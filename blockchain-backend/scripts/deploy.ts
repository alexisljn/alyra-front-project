import { ethers } from "hardhat";

async function main() {
    const votingFactory = await ethers.getContractFactory("Voting");

    const voting = await votingFactory.deploy();

    await voting.deployed();

    const owner = await voting.owner();

    console.log(`Voting contract deployed to ${voting.address} by ${owner}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
