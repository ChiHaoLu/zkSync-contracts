import { Deployer } from "@matterlabs/hardhat-zksync-toolbox"
import * as dotenv from "dotenv"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import * as zk from "zksync-web3"

import * as ethers from "ethers"

// env vars from the .env file.
dotenv.config()

const interact = async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running example interact script for the Greeter contract`)
    console.log()

    // artifact loading
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const wallet =
        hre.network.name === "zkSyncLocal"
            ? zk.Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")
            : new zk.Wallet(process.env.PRIVATE_KEY as string)
    const deployer = new Deployer(hre, wallet)
    const artifact = await deployer.loadArtifact("Greeter")

    // Deposit some funds to L2 in order to be able to perform L2 transactions.
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: zk.utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther("0.001"),
    })
    await depositHandle.wait()

    // contract deployment
    const contract = await deployer.deploy(artifact, ["Hello there!"])
    const contractAddress = contract.address

    // contract loading
    console.log(`Attaching to ${artifact.contractName} contract (${contractAddress})...`)
    const greeterContractFactory = new zk.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        deployer.zkWallet,
    )
    const greeterContract = greeterContractFactory.attach(contractAddress)
    console.log(`Attached to ${artifact.contractName} contract.`)
    console.log()

    // setGreeting function call (WRITE)
    console.log("Setting a new greeting with the setGreeting function...")
    const greeting = "Hello there!"
    const setGreetingHandle = await greeterContract.setGreeting(greeting)
    await setGreetingHandle.wait()
    console.log("New greeting set.")
    console.log()

    // greet function call (READ)
    console.log(`Calling the greet function...`)
    const greetingFromContract = await greeterContract.greet()
    console.log(`Function responded with: ${greetingFromContract}`)
    console.log()

    // setGreeting function call (WRITE)
    console.log("Setting a new greeting with the setGreeting function...")
    const newGreeting = "General Kenobi!"
    const setNewGreetingHandle = await greeterContract.setGreeting(newGreeting)
    await setNewGreetingHandle.wait()
    console.log("New greeting set.")
    console.log()

    // greet function call (READ)
    console.log(`Calling the greet function...`)
    const newGreetingFromContract = await greeterContract.greet()
    console.log(`Function responded with: ${newGreetingFromContract}`)
    console.log()
}

export default interact
