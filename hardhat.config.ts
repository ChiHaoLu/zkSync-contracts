import "@matterlabs/hardhat-zksync-deploy"
import "@matterlabs/hardhat-zksync-solc"
import "@matterlabs/hardhat-zksync-upgradable"

import "tsconfig-paths/register"

import dotenv from "dotenv"
dotenv.config()

const INFURA_TOKEN = process.env.INFURA_TOKEN || ""

module.exports = {
    zksolc: {
        version: "1.3.7", // upgradable plugin currently supports zksolc 1.3.7
        compilerSource: "binary",
        settings: {
            //compilerPath: "zksolc",  // optional. Ignored for compilerSource "docker". Can be used if compiler is located in a specific folder
            experimental: {
                dockerImage: "matterlabs/zksolc", // Deprecated! use, compilerSource: "binary"
                tag: "latest", // Deprecated: used for compilerSource: "docker"
            },
            libraries: {}, // optional. References to non-inlinable libraries
            isSystem: true, // optional.  Enables Yul instructions available only for zkSync system contracts and libraries
            forceEvmla: false, // optional. Falls back to EVM legacy assembly if there is a bug with Yul
            optimizer: {
                enabled: true, // optional. True by default
                mode: "3", // optional. 3 by default, z to optimize bytecode size
            },
        },
    },
    defaultNetwork: "zkSyncLocal",
    networks: {
        // which will be specified with the --netowrk tag
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_TOKEN}`, // The Ethereum Web3 RPC URL (optional).
            zksync: false, // Set to false to target other networks.
        },
        zkSyncEraTestnet: {
            url: "https://zksync2-testnet.zksync.dev", // you should use the URL of the zkSync network RPC
            ethNetwork: "goerli",
            zksync: true,
        },
        zkSyncLocal: {
            // you should run the "matter-labs/local-setup" first
            url: "http://localhost:3050",
            ethNetwork: "http://localhost:8545",
            zksync: true,
        },
        hardhat: {
            zksync: true,
        },
    },
    solidity: {
        version: "0.8.13",
        settings: {
            optimizer: {
                enabled: true,
            },
        },
    },
}
