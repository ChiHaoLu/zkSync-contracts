import * as zk from "zksync-web3"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

export default async function (hre: HardhatRuntimeEnvironment) {
    // Initialize an Ethereum wallet.
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const zkWallet = zk.Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")

    // Private key of the account used to deploy
    const deployer = new Deployer(hre, zkWallet)
    const factoryArtifact = await deployer.loadArtifact("AAFactory")
    const aaArtifact = await deployer.loadArtifact("TwoUserMultisig")

    // Getting the bytecodeHash of the account
    const bytecodeHash = zk.utils.hashBytecode(aaArtifact.bytecode)

    const factory = await deployer.deploy(factoryArtifact, [bytecodeHash], undefined, [
        // Since the factory requires the code of the multisig to be available,
        // we should pass it here as well.
        aaArtifact.bytecode,
    ])

    console.log(`AA factory address: ${factory.address}`)
}
