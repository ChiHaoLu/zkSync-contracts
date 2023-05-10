import { Deployer } from "@matterlabs/hardhat-zksync-deploy"
import * as zk from "zksync-web3"
import chalk from "chalk"

import { HardhatRuntimeEnvironment } from "hardhat/types"

const main = async (hre: HardhatRuntimeEnvironment) => {
    const contractName = "Box"
    console.info(chalk.yellow("Deploying " + contractName + "..."))

    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const zkWallet = zk.Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")

    const deployer = new Deployer(hre, zkWallet)

    const boxContract = await deployer.loadArtifact(contractName)
    const beacon = await hre.zkUpgrades.deployBeacon(deployer.zkWallet, boxContract)
    await beacon.deployed()

    const box = await hre.zkUpgrades.deployBeaconProxy(deployer.zkWallet, beacon, boxContract, [42])
    await box.deployed()

    box.connect(zkWallet)
    const value = await box.retrieve()
    console.info(chalk.cyan("Box value is: ", value.toNumber()))

    // deploy beacon proxy

    const boxBeaconProxy = await hre.zkUpgrades.deployBeaconProxy(
        deployer.zkWallet,
        beacon,
        boxContract,
        [42],
    )
    await boxBeaconProxy.deployed()

    // upgrade beacon

    const boxV2Implementation = await deployer.loadArtifact("BoxV2")
    await hre.zkUpgrades.upgradeBeacon(deployer.zkWallet, beacon.address, boxV2Implementation)
    console.info(
        chalk.green("Successfully upgraded beacon Box to BoxV2 on address: ", beacon.address),
    )

    const attachTo = new zk.ContractFactory(
        boxV2Implementation.abi,
        boxV2Implementation.bytecode,
        deployer.zkWallet,
        deployer.deploymentType,
    )
    const upgradedBox = await attachTo.attach(boxBeaconProxy.address)

    upgradedBox.connect(zkWallet)
    // wait some time before the next call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const newValue = await upgradedBox.retrieve()
    console.info(chalk.cyan("New box value is", newValue))
}

export default main
