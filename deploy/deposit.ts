import { Deployer } from "@matterlabs/hardhat-zksync-toolbox"
import * as dotenv from "dotenv"
import * as ethers from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { utils, Wallet } from "zksync-web3"

// env vars from the .env file.
dotenv.config()

const deposit = async (hre: HardhatRuntimeEnvironment) => {
    console.log(`Running example deposit script for the Greeter contract`)
    console.log()

    // artifact loading
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const wallet =
        hre.network.name === "zkSyncLocal"
            ? Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")
            : new Wallet(process.env.PRIVATE_KEY as string)
    const deployer = new Deployer(hre, wallet)

    // fund deposit to L2 (comment out this block if depositing not needed)
    console.log(`Depositing 0.001 ETH from L1 to L2...`)
    const depositAmount = ethers.utils.parseEther("0.001")
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: depositAmount,
    })
    await depositHandle.wait()
    console.log("Deposit processed.")
    console.log()
}

export default deposit
