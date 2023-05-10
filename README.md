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

In the zkSync-hardhat-plugin, we should run the scripts with the `$ yarn hardhat deploy-zksync`:

```sh
$ yarn hardhat deploy-zksync --network <network_name> --script scripts/<script_name>.ts
```

`<network_name>` could be:

-   `zkSyncEraTestnet`: zkSync Era TestNet
-   `zkSyncLocal`: zkSync Local Devnet

In this repo, you can use the yarn command to run the scripts:

```JSON
"scripts": {
    "execute:local": "yarn hardhat deploy-zksync --network zkSyncLocal --script",
    "execute:eraGoerli": "yarn hardhat deploy-zksync --network zkSyncEra --script"
    // ...
  }
```

### Bridge Goerli ETH to ZkSync Era Testnet

-   [Portal](https://portal.zksync.io/bridge)

### Deploy the Contracts

TBD

### Interact with the Testnet Contracts Example

TBD

### Account Abstraction Demo

```sh
$ yarn execute:local multiSigAccountDemo.ts
```

## Reference

-   [matter-labs/era-tutorial-examples](https://github.com/matter-labs/era-tutorial-examples/tree/main/local-setup-testing)
-   [matter-labs/l2-intro-demo](https://github.com/matter-labs/l2-intro-demo)
-   [matter-labs/l2-intro-ethdenver](https://github.com/matter-labs/l2-intro-ethdenver)
-   [JackHamer09/zkSync-era-Hardhat-example](https://github.com/JackHamer09/zkSync-era-Hardhat-example)
-   [miguelmota/zksync-messenger-l2-to-l1-example](https://github.com/miguelmota/zksync-messenger-l2-to-l1-example)
