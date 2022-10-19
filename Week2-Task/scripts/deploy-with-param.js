const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBookLibraryContract(_privateKey) {
  await run("compile"); //compile the contract using a subtask
  const wallet = new ethers.Wallet(_privateKey, ethers.provider); //New wallet with the privateKey passed from CLI as param

  await hre.run("printInfo", { deployer: wallet.address, balance: (await wallet.getBalance()).toString()});

  const BookLibrary = await ethers.getContractFactory("BookLibrary"); //// Get the contract factory with the signer from the wallet created
  const bookLibrary = await BookLibrary.deploy();

  await bookLibrary.deployed();

  await run("print", { message: `Done! BookLibrary deployed to ${bookLibrary.address}` });

  if(hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
    await hre.run("verify:verify", {
        address: bookLibrary.address
    })
  }
}

module.exports = deployBookLibraryContract;
