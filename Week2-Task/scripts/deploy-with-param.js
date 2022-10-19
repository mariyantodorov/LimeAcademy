const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBookLibraryContract(_privateKey) {
  await run("compile"); //compile the contract using a subtask
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); //New wallet with the privateKey passed from CLI as param

  console.log("Deploying contract with the account:", wallet.address);
  console.log("Account balance:", (await wallet.getBalance()).toString());

  const BookLibrary = await ethers.getContractFactory("BookLibrary"); //// Get the contract factory with the signer from the wallet created
  const bookLibrary = await BookLibrary.deploy();

  console.log("Waiting for BookLibrary deployment...");

  await bookLibrary.deployed();

  await run("print", { message: "Done!" });
  console.log(`BookLibrary deployed to ${bookLibrary.address}`);
}

module.exports = deployBookLibraryContract;
