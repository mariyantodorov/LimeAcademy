import { ethers } from "hardhat";

async function main() {
  const BookLibrary = await ethers.getContractFactory("BookLibrary");
  const bookLibrary = await BookLibrary.deploy();

  await bookLibrary.deployed();

  console.log(`BookLibrary deployed to ${bookLibrary.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
