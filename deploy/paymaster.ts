import * as zk from "zksync-web3"
import * as ethers from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

export default async function (hre: HardhatRuntimeEnvironment) {
    // The wallet that will deploy the token and the paymaster
    // It is assumed that this wallet already has sufficient funds on zkSync
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const wallet =
        hre.network.name === "zkSyncLocal"
            ? zk.Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")
            : new zk.Wallet(process.env.PRIVATE_KEY as string)

    // Setting
    const deployer = new Deployer(hre, wallet)
    const provider = deployer.zkWallet.provider

    // The wallet that will receive ERC20 tokens
    const emptyWallet = new zk.Wallet(zk.Wallet.createRandom().privateKey, provider)
    console.log(`Empty wallet's address: ${emptyWallet.address}`)
    console.log(`Empty wallet's private key: ${emptyWallet.privateKey}`)

    // Deposit some funds to L2 in order to be able to perform L2 transactions.
    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: zk.utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther("0.001"),
    })
    await depositHandle.wait()

    // Deploying the ERC20 token
    const erc20Artifact = await deployer.loadArtifact("MyERC20")
    const erc20 = await deployer.deploy(erc20Artifact, ["MyToken", "MyToken", 18])
    console.log(`ERC20 address: ${erc20.address}`)

    // Deploying the paymaster
    const paymasterArtifact = await deployer.loadArtifact("Paymaster")
    const paymaster = await deployer.deploy(paymasterArtifact, [erc20.address])
    console.log(`Paymaster address: ${paymaster.address}`)

    console.log("Funding paymaster with ETH")
    // Supplying paymaster with ETH
    await (
        await deployer.zkWallet.sendTransaction({
            to: paymaster.address,
            value: ethers.utils.parseEther("0.6"),
        })
    ).wait()

    const ethBalance = await provider.getBalance(emptyWallet.address)
    if (!ethBalance.eq(0)) {
        throw new Error("The wallet is not empty!")
    } else {
        console.log(`emptyWallet ETH balance is now ${ethBalance.toString()}`)
    }

    let paymasterBalance = await provider.getBalance(paymaster.address)

    console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`)

    // Supplying the ERC20 tokens to the empty wallet:
    await (await erc20.mint(emptyWallet.address, 10)).wait()

    console.log(
        `ERC20 token balance of the empty wallet before mint: ${await emptyWallet.getBalance(
            erc20.address,
        )}`,
    )
    const erc20ConnectEmptyWallet = new ethers.Contract(
        erc20.address,
        erc20Artifact.abi,
        emptyWallet,
    )
    const gasPrice = await provider.getGasPrice()

    // Encoding the "ApprovalBased" paymaster flow's input
    const paymasterParams = zk.utils.getPaymasterParams(paymaster.address, {
        type: "ApprovalBased",
        token: erc20ConnectEmptyWallet.address,
        // set minimalAllowance as we defined in the paymaster contract
        minimalAllowance: ethers.BigNumber.from(1),
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
    })

    // Estimate gas fee for mint transaction
    const gasLimit = await erc20ConnectEmptyWallet.estimateGas.mint(emptyWallet.address, 5, {
        customData: {
            gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: paymasterParams,
        },
    })

    const fee = gasPrice.mul(gasLimit.toString())
    console.log("Transaction fee estimation is :>> ", fee.toString())

    console.log(`Minting 5 tokens for empty wallet via paymaster...`)
    console.log(`   - Pay 1 token as fee for paymaster`)
    await (
        await erc20ConnectEmptyWallet.mint(emptyWallet.address, 5, {
            // paymaster info
            customData: {
                paymasterParams: paymasterParams,
                gasPerPubdata: zk.utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            },
        })
    ).wait()

    console.log(
        `Paymaster ERC20 token balance is now ${await erc20ConnectEmptyWallet.balanceOf(
            paymaster.address,
        )}`,
    )

    paymasterBalance = await provider.getBalance(paymaster.address)
    console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`)

    console.log(
        `ERC20 token balance of the empty wallet after mint: ${await emptyWallet.getBalance(
            erc20ConnectEmptyWallet.address,
        )}`,
    )
}
