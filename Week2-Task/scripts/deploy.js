const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBookLibraryContract() {
    await hre.run("compile"); //compile the contract using a subtask
    const [deployer] = await ethers.getSigners(); //get the deployer
  
    console.log("Deploying contract with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const BookLibrary = await ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BookLibrary.deploy();
  
    console.log("Waiting for BookLibrary deployment...");
  
    await bookLibrary.deployed();
  
    await hre.run("print", { message: "Done!" });
    console.log(`BookLibrary deployed to ${bookLibrary.address}`);
}
  
module.exports = deployBookLibraryContract;