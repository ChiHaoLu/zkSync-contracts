import { Deployer } from "@matterlabs/hardhat-zksync-deploy"
import { Wallet } from "zksync-web3"
import chalk from "chalk"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const main = async (hre: HardhatRuntimeEnvironment) => {
    const contractName = "Box"
    console.info(chalk.yellow("Deploying " + contractName + "..."))

    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const zkWallet = Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")

    const deployer = new Deployer(hre, zkWallet)

    const contract = await deployer.loadArtifact(contractName)
    const box = await hre.zkUpgrades.deployProxy(deployer.zkWallet, contract, [42], {
        initializer: "store",
    })

    await box.deployed()

    box.connect(zkWallet)
    const value = await box.retrieve()
    console.info(chalk.cyan("Box value is: ", value.toNumber()))

    // upgrade proxy implementation

    const BoxV2 = await deployer.loadArtifact("BoxV2")
    const upgradedBox = await hre.zkUpgrades.upgradeProxy(deployer.zkWallet, box.address, BoxV2)
    console.info(chalk.green("Successfully upgraded Box to BoxV2"))

    upgradedBox.connect(zkWallet)
    const newValue = await upgradedBox.retrieve()
    console.info(chalk.cyan("Box value is", newValue))
}

export default main
