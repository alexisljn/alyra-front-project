import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");

dotenv.config();

const INFURA_KEY = process.env.INFURA_KEY || '';
const DEV_PRIVATE_KEY = process.env.DEV_PRIVATE_KEY || ''


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {
  /* Uncomment the line below if metamask fix has to be done in hardhat */
  //     chainId: 1337
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      accounts: [DEV_PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: "../frontend/public/artifacts"
  }
};

export default config;
