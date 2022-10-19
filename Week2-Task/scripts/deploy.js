const hre = require('hardhat')
const ethers = hre.ethers;

async function deployBookLibraryContract() {
    await hre.run("compile"); //compile the contract using a subtask
    const [deployer] = await ethers.getSigners(); //get the deployer

    await hre.run("printInfo", { deployer: deployer.address, balance: (await deployer.getBalance()).toString()});
    
    const BookLibrary = await ethers.getContractFactory("BookLibrary");
    const bookLibrary = await BookLibrary.deploy();
  
    await bookLibrary.deployed();
  
    await hre.run("print", { message: `Done! BookLibrary deployed to ${bookLibrary.address}` });

    if(hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
        await hre.run("verify:verify", {
            address: bookLibrary.address
        })
    }
}
  
module.exports = deployBookLibraryContract;