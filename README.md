# zkSync Contracts

> 1. To successfullty development in the zkSync, I highly encourage everyone scan the `hardhat.config.ts` first, there are lots of comments in this config.
> 1. Lots of examples are modified or copied from the repo listed in references, very thanks to zkSync and other impressive developers.

## Set-up

```sh
$ yarn install --frozen-lockfile
$ cp .env.example .env
$ yarn build
```

Compile the Contracts

```sh
$ yarn run compile
```

## Waiting List

-   ✅ Construct the Development Env（TestNet & Local Devnet）
-   ✅ [Deploy normal contract（`deploy.ts`）](#deploy-the-contracts)
-   ✅ [Interact with other contracts（`interact.ts`）](#interact-with-the-testnet-contracts-example)
-   ✅ [Deposit from L1 → L2（`deposit.ts`）](#bridge-goerli-eth-to-zksync-era-testnet)
-   ✅ [Basic Test（`test` folder](#test-the-contracts)
-   ✅ [Use Proxy Contract + Upgrade（`transparentUpgradableProxies.ts` & `beaconProxies.ts`）](#upgradable)
-   ✅ [Demo the MultiSig AA（`multiSigAccount.ts`）](#multisig-account-abstraction-demo)
-   ✅ [Paymaster (`paymaster.ts`)](#paymaster)
-   🔨 Daily Limitation
-   🔨 Multi Calls
-   🔨 Other Signature Algos.
-   🔨 L1 → L2 Msg
-   🔨 L2 → L1 Msg
-   🔨 Social Recovery Account
-   🔨 Plugin (e.g. Session Key)

## Test the Contracts

> -   We need to run the local devnet([matter-labs/local-setup](https://github.com/matter-labs/local-setup)) first.
> -   After run the local devnet, you should wait for local devnet to run the node about 5 mins.
>
> ```sh
> # In another folder
> $ git clone https://github.com/matter-labs/local-setup.git
> $ cd local-setup
> $ ./start.sh
> ```

Run test:

```sh
# In this repo root
$ yarn test
>
$ NODE_ENV=test hardhat test
Compiling 1 Solidity file
Successfully compiled 1 Solidity file

  Greeter
Deploying contract
Contract deployed
    ✔ Should return the new greeting once it's changed (5044ms)


  1 passing (10s)

✨  Done in 11.91s.
```

## Scripts

In the zkSync-hardhat-plugin, we should run the scripts with the `$ yarn hardhat deploy-zksync`, it will run the specified script in the `deploy` folder:

```sh
$ yarn hardhat deploy-zksync --network <network_name> --script scripts/<script_name>.ts
```

`<network_name>` could be:

-   `zkSyncEraTestnet`: zkSync Era TestNet
-   `zkSyncLocal`: zkSync Local Devnet

In this repo, you can use the yarn command to run the scripts by choosing different netowrk:

```JSON
"scripts": {
    "execute:local": "hardhat deploy-zksync --network zkSyncLocal --script",
    "execute:eraGoerli": "hardhat deploy-zksync --network zkSyncEra --script"
}
```

### Bridge Goerli ETH to ZkSync Era Testnet

```sh
$ yarn execute:local deposit.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script deposit.ts
Running example deposit script for the Greeter contract

Depositing 0.001 ETH from L1 to L2...
Deposit processed.

✨  Done in 5.80s.
```

-   [Portal](https://portal.zksync.io/bridge)

### Deploy the Contracts

```sh
$ yarn execute:local deploy.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script deploy.ts
Running example deploy script for the Greeter contract

Greeter contract deployment started...
Greeter contract deployment finished.
Contract address: 0x111C3E89Ce80e62EE88318C2804920D4c96f92bb
Constructor args: 'Hello there!'

Calling the greet function...
Function responded with: Hello there!

Setting a new greeting with the setGreeting function...
New greeting set.

Calling the greet function...
Function responded with: General Kenobi!

✨  Done in 9.64s.
```

### Interact with the Testnet Contracts Example

```sh
$ yarn execute:local interact.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script interact.ts
Running example interact script for the Greeter contract

Attaching to Greeter contract (0x4B5DF730c2e6b28E17013A1485E5d9BC41Efe021)...
Attached to Greeter contract.

Setting a new greeting with the setGreeting function...
New greeting set.

Calling the greet function...
Function responded with: Hello there!

Setting a new greeting with the setGreeting function...
New greeting set.

Calling the greet function...
Function responded with: General Kenobi!

✨  Done in 11.32s.
```

### MultiSig Account Abstraction Demo

```sh
$ yarn execute:local multiSigAccount.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script multiSigAccount.ts
Running deploy script for the Account Abstraction
Greeter was deployed to 0xc0431C32561DabE0c8FD791B52590BbBA413c235
Multisig was deployed to 0x996462e0eAf00bF6BF0Ea15F29d715C0eD3906F1
Signaure is Valid in MultiSigAccount!
The multisig's nonce before the first tx is 0
The multisig's nonce after the first tx is 1
Successfully initiated tx from deployed multisig!

✨  Done in 11.92s.
```

You can also deploy with the AA Factory:

```sh
$ yarn hardhat deploy-zksync --network zkSyncLocal --script deployAAFactory.ts
>
AA factory address: 0x3ccA24e1A0e49654bc3482ab70199b7400eb7A3a
```

### Upgradable

#### Transparent upgradable proxies

Transparent upgradable proxies provide a way to upgrade a smart contract without changing its address or requiring any change in the contract's interaction code. With transparent proxies, a contract's address is owned by a proxy contract, which forwards all calls to the actual contract implementation. When a new implementation is deployed, the proxy can be upgraded to point to the new implementation, allowing for seamless upgrades without requiring changes to the contract's interaction code.

```sh
$ yarn execute:local transparentUpgradableProxies.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script transparentUpgradableProxies.ts
Deploying Box...
Implementation contract was deployed to 0x26b368C3Ed16313eBd6660b72d8e4439a697Cb0B
Admin was deployed to 0x094499Df5ee555fFc33aF07862e43c90E6FEe501
Transparent proxy was deployed to 0xb76eD02Dea1ba444609602BE5D587c4bFfd67153
Box value is:  42
Contract successfully upgraded to  0xf2FcC18ED5072b48C0a076693eCa72fE840b3981  with tx  0x836fe18fd51a4fbdbefaedf95ec6ded5967e17b0022b343e8ed1c43a734a1a55
Successfully upgraded Box to BoxV2
Box value is V2: 42

✨  Done in 10.87s.
```

#### Beacon proxies

Beacon proxies are a more advanced form of proxy that use an intermediate contract (called the Beacon contract) to delegate calls to a specific implementation contract.

Beacon proxies enable a more advanced upgrade pattern, where multiple implementation contracts can be deployed and "hot-swapped" on the fly with no disruption to the contract's operation.

This allows for more advanced upgrade patterns, such as adding or removing functionality while minimizing downtime.

```sh
$ yarn execute:local beaconProxies.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script beaconProxies.ts
Deploying Box...
Beacon impl deployed at 0x26b368C3Ed16313eBd6660b72d8e4439a697Cb0B
Warning: A proxy admin was previously deployed on this network

    This is not natively used with the current kind of proxy ('beacon').
    Changes to the admin will have no effect on this new proxy.

Beacon proxy deployed at:  0x60Aa68f9D0D736B9a0a716d04323Ba3b22602840
Box value is:  42
Warning: A proxy admin was previously deployed on this network

    This is not natively used with the current kind of proxy ('beacon').
    Changes to the admin will have no effect on this new proxy.

Beacon proxy deployed at:  0x65C899B5fb8Eb9ae4da51D67E1fc417c7CB7e964
New beacon impl deployed at 0xf2FcC18ED5072b48C0a076693eCa72fE840b3981
Successfully upgraded beacon Box to BoxV2 on address:  0x5fE58d975604E6aF62328d9E505181B94Fc0718C
New box value is V2: 42

✨  Done in 9.72s.
```

### Paymaster

```sh
$ yarn execute:local paymaster.ts
>
$ hardhat deploy-zksync --network zkSyncLocal --script paymaster.ts
Empty wallet's address: 0xc4C469E81A6BFdE53eB71D653a653fb14E36A09c
Empty wallet's private key: 0x70f4e3224f5d6c426016bf5098339977b6c17c92238189b9162965074618bdb0
ERC20 address: 0xf43624d811c5DC9eF91cF237ab9B8eE220D438eE
Paymaster address: 0xE015ADD43D2C41e8Af4e9238e389101884853896
Funding paymaster with ETH
emptyWallet ETH balance is now 0
Paymaster ETH balance is now 600000000000000000
ERC20 token balance of the empty wallet before mint: 10
Transaction fee estimation is :>>  53975500000000
Minting 5 tokens for empty wallet via paymaster...
   - Pay 1 token as fee for paymaster
Paymaster ERC20 token balance is now 1
Paymaster ETH balance is now 599955631000000000
ERC20 token balance of the empty wallet after mint: 14

✨  Done in 12.32s.
```

---

## Reference

### Overall

-   [matter-labs/era-tutorial-examples](https://github.com/matter-labs/era-tutorial-examples/tree/main/local-setup-testing)
-   [matter-labs/custom-aa-tutorial](https://github.com/matter-labs/custom-aa-tutorial/tree/main)
-   [matter-labs/l2-intro-demo](https://github.com/matter-labs/l2-intro-demo)
-   [matter-labs/l2-intro-ethdenver](https://github.com/matter-labs/l2-intro-ethdenver)
-   [JackHamer09/zkSync-era-Hardhat-example](https://github.com/JackHamer09/zkSync-era-Hardhat-example)
-   [miguelmota/zksync-messenger-l2-to-l1-example](https://github.com/miguelmota/zksync-messenger-l2-to-l1-example)

### Paymaster

-   [matter-labs/custom-paymaster-tutorial](https://github.com/matter-labs/custom-paymaster-tutorial)
-   [vareger/zksync-aa-tests](https://github.com/vareger/zksync-aa-tests)
-   [kariy/zksync-contracts](https://github.com/kariy/zksync-contracts/blob/bec65b47d5c5cce43bd900d4a08ecbbe52f38cde/contracts/WalletFactory.sol#L61)
-   [chee-chyuan/zksync-custom-paymaster-poc](https://github.com/chee-chyuan/zksync-custom-paymaster-poc/tree/490e766a78c2b0e9984bf76c64b8c91093d8a0c3)
-   [pycckuu/zk-onboarding-service](https://github.com/pycckuu/zk-onboarding-service/blob/b2556e8a6bcc4027d5e904ad74d299b21b6eb100/contracts/Paymaster.sol#L36)
