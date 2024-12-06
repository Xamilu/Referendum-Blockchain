import { ethers } from "hardhat";

async function main() {
    const Proposals = await ethers.getContractFactory("Proposals");
    const proposals = await Proposals.deploy();
    await proposals.waitForDeployment();

    console.log(`Lottery deployed to: ${await proposals.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});