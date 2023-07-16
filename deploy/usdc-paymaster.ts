import { ContractFactory, Provider, utils, Wallet } from "zksync-web3"
import * as ethers from "ethers"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Deployer } from "@matterlabs/hardhat-zksync-deploy"

require("dotenv").config()

export default async function (hre: HardhatRuntimeEnvironment) {
    const provider = new Provider("https://testnet.era.zksync.dev")
    const testMnemonic =
        "stuff slice staff easily soup parent arm payment cotton trade scatter struggle"
    const emptyWallet =
        hre.network.name === "zkSyncLocal"
            ? Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0")
            : new Wallet(process.env.PRIVATE_KEY as string, provider)
    const deployer = new Deployer(hre, emptyWallet)

    // Deploying the ERC20 token
    const erc20Artifact = await deployer.loadArtifact("MyERC20");
    const erc20 = await deployer.deploy(erc20Artifact, ["USDC", "USDC", 18]);
    console.log(`ERC20 address: ${erc20.address}`);
    const TOKEN_ADDRESS = erc20.address

    // Deploying the paymaster
    const paymasterArtifact = await deployer.loadArtifact("USDCPaymaster");
    const paymaster = await deployer.deploy(paymasterArtifact, [erc20.address]);
    console.log(`Paymaster address: ${paymaster.address}`);
    const PAYMASTER_ADDRESS = paymaster.address

    // Supplying paymaster with ETH.
    await (
        await deployer.zkWallet.sendTransaction({
        to: paymaster.address,
        value: ethers.utils.parseEther("0.005"),
        })
    ).wait();

    // Setting the dAPIs in Paymaster. Head over to the API3 Market (https://market.api3.org) to verify dAPI proxy contract addresses and whether they're funded or not.
    const ETHUSDdAPI = "0x28ce555ee7a3daCdC305951974FcbA59F5BdF09b";
    const USDCUSDdAPI = "0x946E3232Cc18E812895A8e83CaE3d0caA241C2AB";
    const setProxy = paymaster.setDapiProxy(USDCUSDdAPI, ETHUSDdAPI)
    await (await setProxy).wait()
    console.log("dAPI Proxies Set!")

    // Deploying the Greeter contract
    const greeterContractArtifact = await deployer.loadArtifact("Greeter");
    const oldGreeting = "old greeting"
    const greeter = await deployer.deploy(greeterContractArtifact, [oldGreeting]);
    console.log(`Greeter contract address: ${greeter.address}`);

    // Supplying the ERC20 tokens to the empty wallet:
    await // We will give the empty wallet 5k mUSDC:
    (await erc20.mint(emptyWallet.address, "5000000000000000000000")).wait();

    console.log("Minted 5k mUSDC for the empty wallet");

    // Obviously this step is not required, but it is here purely to demonstrate that indeed the wallet has no ether.
    // const ethBalance = await emptyWallet.getBalance()
    // if (!ethBalance.eq(0)) {
    //     throw new Error("The wallet is not empty")
    // }

    const erc20Balance = await emptyWallet.getBalance(TOKEN_ADDRESS)
    console.log(`ERC20 balance of the user before tx: ${erc20Balance}`)

    const gasPrice = await provider.getGasPrice()

    // Estimate gas fee for the transaction
    const gasLimit = await greeter.estimateGas.setGreeting("new updated greeting", {
        customData: {
            gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
            paymasterParams: utils.getPaymasterParams(PAYMASTER_ADDRESS, {
                type: "ApprovalBased",
                token: TOKEN_ADDRESS,
                // Set a large allowance just for estimation
                minimalAllowance: ethers.BigNumber.from(`100000000000000000000`),
                // Empty bytes as testnet paymaster does not use innerInput
                innerInput: new Uint8Array(),
            }),
        },
    })

    // Gas estimation:
    const fee = gasPrice.mul(gasLimit.toString())
    console.log(`Estimated ETH FEE (gasPrice * gasLimit): ${fee}`)

    // Calling the dAPI to get the ETH price:
    const ETHUSD = await paymaster.readDapi("0x28ce555ee7a3daCdC305951974FcbA59F5BdF09b")
    const USDCUSD = await paymaster.readDapi("0x946E3232Cc18E812895A8e83CaE3d0caA241C2AB")

    // Checks old allowance (for testing purposes):
    const checkSetAllowance = await erc20.allowance(emptyWallet.address, PAYMASTER_ADDRESS)
    console.log(`ERC20 allowance for paymaster : ${checkSetAllowance}`)

    console.log(`ETH/USD dAPI Value: ${ETHUSD}`)
    console.log(`USDC/USD dAPI Value: ${USDCUSD}`)

    // Calculating the USD fee:
    const usdFee = fee.mul(ETHUSD).div(USDCUSD)
    console.log(`Estimated USD FEE: ${usdFee}`)

    console.log(`Current message is: ${await greeter.greet()}`)

    // Encoding the "ApprovalBased" paymaster flow's input
    const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
        type: "ApprovalBased",
        token: TOKEN_ADDRESS,
        // set minimalAllowance to the estimated fee in erc20
        minimalAllowance: ethers.BigNumber.from(usdFee),
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
    })

    await(
        await greeter
            .connect(emptyWallet)
            .setGreeting(`new greeting`, {
                // specify gas values
                maxFeePerGas: gasPrice,
                maxPriorityFeePerGas: 0,
                gasLimit: gasLimit,
                // paymaster info
                customData: {
                    paymasterParams: paymasterParams,
                    gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
                },
            })
    ).wait()

    const newErc20Balance = await emptyWallet.getBalance(TOKEN_ADDRESS)
    console.log(`ERC20 Balance of the user after tx: ${newErc20Balance}`)
    console.log(`Transaction fee paid in ERC20 was ${erc20Balance.sub(newErc20Balance)}`)
    console.log(`Message in contract now is: ${await greeter.greet()}`)
}
