import * as zk from "zksync-web3"
import * as ethers from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-toolbox"

const ETH_ADDRESS = "0x000000000000000000000000000000000000800A"

export default async function (hre: HardhatRuntimeEnvironment) {
    // Basic Config Setting
    const provider = new zk.Provider(hre.config.networks.zkSyncLocal.url)
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const zkWallet = zk.Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")

    // Create deployer objects and load desired artifacts.
    const aaDeployer = new Deployer(hre, zkWallet, "createAccount")
    const deployer = new Deployer(hre, zkWallet)
    const aaArtifact = await deployer.loadArtifact("Account")

    // Deposit some funds to L2 in order to be able to perform L2 transactions.
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: zk.utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther("50"),
    })
    await depositHandle.wait()

    // Deploy Daily Limit Account
    const account = await aaDeployer.deploy(aaArtifact, [zkWallet.address], undefined, [])
    const ACCOUNT_ADDRESS = account.address
    console.log(`SC Account deployed on address ${ACCOUNT_ADDRESS}`)
    console.log("Funding smart contract account with some ETH")
    await (
        await deployer.zkWallet.sendTransaction({
            to: ACCOUNT_ADDRESS,
            value: ethers.utils.parseEther("6"),
        })
    ).wait()
    console.log(`Done!`)

    /**
     * Set the daily spending limit
     */

    console.log("\n1. Try to set limit for account...")

    let setLimitTx = await account.populateTransaction.setSpendingLimit(
        ETH_ADDRESS,
        ethers.utils.parseEther("0.0005"),
    )

    setLimitTx = {
        ...setLimitTx,
        from: ACCOUNT_ADDRESS,
        chainId: (await provider.getNetwork()).chainId,
        nonce: await provider.getTransactionCount(ACCOUNT_ADDRESS),
        type: 113,
        customData: {
            gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        } as zk.types.Eip712Meta,
        value: ethers.BigNumber.from(0),
    }

    setLimitTx.gasPrice = await provider.getGasPrice()
    setLimitTx.gasLimit = await provider.estimateGas(setLimitTx)

    const signedTxHash = zk.EIP712Signer.getSignedDigest(setLimitTx)

    const signature = ethers.utils.arrayify(
        ethers.utils.joinSignature(zkWallet._signingKey().signDigest(signedTxHash)),
    )

    setLimitTx.customData = {
        ...setLimitTx.customData,
        customSignature: signature,
    }

    console.log("Setting limit for account...")
    const sentTx = await provider.sendTransaction(zk.utils.serialize(setLimitTx))
    await sentTx.wait()

    const limit = await account.limits(ETH_ADDRESS)
    console.log("Account limit enabled?: ", limit.isEnabled)
    console.log("Account limit: ", limit.limit.toString())
    console.log("Available limit today: ", limit.available.toString())
    console.log("Time to reset limit: ", limit.resetTime.toString())

    /**
     * Perform ETH transfer
     */

    console.log("\n2. Try to perform the ETH transfer for fail...")
    const receiver = zkWallet.address
    // ⚠️ update this amount to test if the limit works; 0.00051 fails but 0.0049 succeeds
    const transferAmount = "0.00051"

    let ethTransferTx = {
        from: ACCOUNT_ADDRESS,
        to: receiver,
        chainId: (await provider.getNetwork()).chainId,
        nonce: await provider.getTransactionCount(ACCOUNT_ADDRESS),
        type: 113,
        customData: {
            ergsPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        } as zk.types.Eip712Meta,

        value: ethers.utils.parseEther(transferAmount),
        gasPrice: await provider.getGasPrice(),
        gasLimit: ethers.BigNumber.from(20000000), // constant 20M since estimateGas() causes an error and this tx consumes more than 15M at most
        data: "0x",
    }
    const signedTxHash1 = zk.EIP712Signer.getSignedDigest(ethTransferTx)
    const signature1 = ethers.utils.arrayify(
        ethers.utils.joinSignature(zkWallet._signingKey().signDigest(signedTxHash1)),
    )

    ethTransferTx.customData = {
        ...ethTransferTx.customData,
        customSignature: signature1,
    }

    // read account limits
    const limitData = await account.limits(ETH_ADDRESS)

    console.log("Account ETH limit is: ", limitData.limit.toString())
    console.log("Available today: ", limitData.available.toString())

    // L1 timestamp tends to be undefined in latest blocks. So it should find the latest L1 Batch first.
    let l1BatchRange = await provider.getL1BatchBlockRange(await provider.getL1BatchNumber())
    let l1TimeStamp = (await provider.getBlock(l1BatchRange[1])).l1BatchTimestamp

    console.log("L1 timestamp: ", l1TimeStamp)
    console.log("Limit will reset on timestamp: ", limitData.resetTime.toString())

    // actually do the ETH transfer
    console.log("Sending ETH transfer from smart contract account")
    try {
        const sentTx1 = await provider.sendTransaction(zk.utils.serialize(ethTransferTx))
        await sentTx1.wait()
        console.log(`ETH transfer tx hash is ${sentTx1.hash}`)

        console.log("Transfer completed and limits updated!")

        const newLimitData = await account.limits(ETH_ADDRESS)
        console.log("Account limit: ", newLimitData.limit.toString())
        console.log("Available today: ", newLimitData.available.toString())
        console.log("Limit will reset on timestamp:", newLimitData.resetTime.toString())

        if (newLimitData.resetTime.toString() == limitData.resetTime.toString()) {
            console.log("Reset time was not updated as not enough time has passed")
        } else {
            console.log("Limit timestamp was reset")
        }
    } catch (e: any) {
        console.log(
            `Your transfer amount ${ethers.utils.parseEther(
                transferAmount,
            )} is more than the available amount ${limitData.available.toString()}!`,
        )
        console.log()
        // console.log(e)
    }
    return
}
