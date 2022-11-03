const hre = require("hardhat");

async function main() {
    const ETHWrapperFactory = await hre.ethers.getContractFactory("ETHWrapper");
    const provider = new hre.ethers.providers.InfuraProvider("goerli", "199e48875a4f431e8ebaed6412865604");
    const wallet = new hre.ethers.Wallet("8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc", provider);
    const balance = await wallet.getBalance();
    const wrapValue = hre.ethers.utils.parseEther("1");

    console.log(balance.toString());
    const ETHWrapperContract = await ETHWrapperFactory.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    console.log(ETHWrapperContract.address);
    
    //wrapping
    const tx = await ETHWrapperContract.wrap({value: wrapValue});
    await tx.wait();
    let contractETHBalance = await provider.getBalance(ETHWrapperContract.address);
    console.log("Contract ETH balance after wrapping:", contractETHBalance.toString());

    //unwrapping
    const WETHFactory = await hre.ethers.getContractFactory("WETH");
    const wethAddress = await ETHWrapperContract.WETHToken();
    const WETHContract = await WETHFactory.attach(wethAddress);

    const approveTx = await WETHContract.approve(ETHWrapperContract.address, wrapValue)
    await approveTx.wait()
    
    const unwrapTx = await ETHWrapperContract.unwrap(wrapValue)
    await unwrapTx.wait()
    
    balance = await WETHContract.balanceOf(wallet.address)
    console.log("Balance after unwrapping:", balance.toString())
    
    contractETHBalance = await provider.getBalance(ETHWrapperContract.address);
    console.log("Contract ETH balance after unwrapping:", contractETHBalance.toString())
}

main().then(() => process.exit(0)).catch((error) => {
    console.log(error);
    process.exit(1);
})