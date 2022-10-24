import { USElection } from "../typechain-types/contracts/USElection";
import USelection from "../artifacts/contracts/USElection.sol/USElection.json";
import hre, { ethers } from "hardhat";

async function main() {
  const provider = new hre.ethers.providers.InfuraProvider(
    "goerli",
    "199e48875a4f431e8ebaed6412865604"
  );
  // const latestBlock = await provider.getBlock("latest")
  // console.log(latestBlock.hash)

  const wallet = new hre.ethers.Wallet(
    "8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc",
    provider
  );
  const balance = await wallet.getBalance();
  // console.log(balance.toString());
  // console.log(hre.ethers.utils.formatEther(balance, 18));

  const contractAddress = "0xAD7bA2160b48873a8707c02cC627540A90D69b33";
  const electionContract = new hre.ethers.Contract(
    contractAddress,
    USelection.abi,
    wallet
  );
  //console.log(electionContract);

  const hasEnded = await electionContract.electionEnded();
  console.log("The election has ended:", hasEnded);

  const haveResultsforOhio = await electionContract.resultsSubmitted("Ohio");
  console.log("Have results for Ohio:", haveResultsforOhio);

  const transactionOhio = await electionContract.submitStateResult([
    "Ohio",
    250,
    150,
    24,
  ]);
  const transactionReceipt = await transactionOhio.wait();
  if (transactionReceipt.status != 1) {
    // 1 means success
    console.log("Transaction was not successful");
    return;
  }

  const resultSubmittedOhioNew = await electionContract.resultsSubmitted(
    "Ohio"
  );
  console.log("Result submited for Ohio:", resultSubmittedOhioNew);

  const currentLeader = await electionContract.currentLeader();
  console.log("Current leader:", currentLeader);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
