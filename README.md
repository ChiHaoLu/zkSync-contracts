# zkSync Contracts

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

## Test the Contracts

> We need to run the local testnet([matter-labs/local-setup](https://github.com/matter-labs/local-setup)) first.
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

### Account Abstraction Demo

```sh
$ yarn execute:local multiSigAccountDemo.ts
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

## Reference

-   [matter-labs/era-tutorial-examples](https://github.com/matter-labs/era-tutorial-examples/tree/main/local-setup-testing)
-   [matter-labs/custom-aa-tutorial](https://github.com/matter-labs/custom-aa-tutorial/tree/main)
-   [matter-labs/l2-intro-demo](https://github.com/matter-labs/l2-intro-demo)
-   [matter-labs/l2-intro-ethdenver](https://github.com/matter-labs/l2-intro-ethdenver)
-   [JackHamer09/zkSync-era-Hardhat-example](https://github.com/JackHamer09/zkSync-era-Hardhat-example)
-   [miguelmota/zksync-messenger-l2-to-l1-example](https://github.com/miguelmota/zksync-messenger-l2-to-l1-example)
