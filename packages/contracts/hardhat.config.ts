import { HardhatUserConfig, task } from "hardhat/config";
import { nodeUrl, accounts } from "./utils/network";

import "dotenv/config";

// Plugins
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "hardhat-storage-layout";

// Storage Layout Task
task("storage-layout", async (_, hre) => {
  await hre.storageLayout.export();
});

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: {
      default: 0,
      mainnet: process.env.MAINNET_ACCOUNT_ADDRESS || 0,
    },
    tokenOwner: {
      default: 1,
      ropsten: "0x10281799d2904046a3b8De084d1dCF440Dbc37D1",
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      accounts: accounts(),
      chainId: 1337,
    },
    localhost: {
      url: nodeUrl("localhost"),
      accounts: accounts(),
    },
    mainnet: {
      url: nodeUrl("mainnet"),
      accounts: accounts("mainnet"),
    },
    rinkeby: {
      url: nodeUrl("rinkeby"),
      accounts: accounts("rinkeby"),
    },
    kovan: {
      url: nodeUrl("kovan"),
      accounts: accounts("kovan"),
    },
    goerli: {
      url: nodeUrl("goerli"),
      accounts: accounts("goerli"),
    },
    ropsten: {
      url: nodeUrl("ropsten"),
      accounts: accounts("ropsten"),
    },
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  typechain: {
    target: "ethers-v5",
    outDir: "../swap-app/types/typechain",
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 100,
  },
};

export default config;
