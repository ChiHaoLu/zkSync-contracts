"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("tsconfig-paths/register");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const INFURA_TOKEN = process.env.INFURA_TOKEN || "";
module.exports = {
    zksolc: {
        version: "1.3.10",
        compilerSource: "binary",
        settings: {
            //compilerPath: "zksolc",  // optional. Ignored for compilerSource "docker". Can be used if compiler is located in a specific folder
            experimental: {
                dockerImage: "matterlabs/zksolc",
                tag: "latest", // Deprecated: used for compilerSource: "docker"
            },
            libraries: {},
            isSystem: false,
            forceEvmla: false,
            optimizer: {
                enabled: true,
                mode: "3", // optional. 3 by default, z to optimize bytecode size
            },
        },
    },
    defaultNetwork: "zkTestnet",
    networks: {
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_TOKEN}`,
            zksync: false, // Set to false to target other networks.
        },
        zkTestnet: {
            url: "https://testnet.era.zksync.dev",
            ethNetwork: "goerli",
            zksync: true,
        },
    },
    // defaultNetwork: "zkTestnet", // optional (if not set, use '--network zkTestnet')
    solidity: {
        version: "0.8.13",
        settings: {
            optimizer: {
                enabled: true,
            },
        },
    },
};
//# sourceMappingURL=hardhat.config.js.map