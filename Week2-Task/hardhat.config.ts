import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "./tasks/deploy-testnets";
import "./tasks/deploy-mainnet";
import "./tasks/print.subtask";
import "./tasks/printInfo.subtask";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/199e48875a4f431e8ebaed6412865604",
      accounts: [
        "8b81e9caa6bf9213794c34c4a12b2fe85996a94bd4e0845659ba7325ddd3cdfc",
      ],
    },
  },
  etherscan: {
    apiKey: "",
  },
};

export default config;
