import { Deployer } from "@matterlabs/hardhat-zksync-toolbox"
import * as dotenv from "dotenv"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Wallet } from "zksync-web3"

// env vars from the .env file.
dotenv.config()

const deploy = async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running example deploy script for the Greeter contract`)
    console.log()

    // private key from env var
    const privateKey =
        hre.network.name === "zkSyncLocal"
            ? process.env.LOCAL_TESTNET_RICH_WALLET_PRIVATE_KEY
            : process.env.PRIVATE_KEY
    if (!privateKey) {
        throw new Error(
            `Please set your PRIVATE_KEY in the '.env' file. Use the '.env.example' file as an example.`,
        )
    }

    // artifact loading
    const wallet = new Wallet(privateKey)
    const deployer = new Deployer(hre, wallet)
    const artifact = await deployer.loadArtifact("Greeter")

    // contract deployment
    console.log(`${artifact.contractName} contract deployment started...`)
    const greeting = "Hello there!"
    const constructorArguments = [greeting]
    const greeterContract = await deployer.deploy(artifact, constructorArguments)
    console.log(`${artifact.contractName} contract deployment finished.`)
    console.log(`Contract address: ${greeterContract.address}`)
    const constructorArgumentsString = constructorArguments.map((arg) => `'${arg}'`).join(" ")
    console.log(`Constructor args: ${constructorArgumentsString}`)
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

export default deploy
