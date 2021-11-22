#  Blockchain Developer Bootcamp: Final Project
This project will implement an Automated Market Maker (AMM) application based on the Uniswap V2 model.

## Useful Links

- [**Deployed Website**](https://blockchain-developer-bootcamp-final-project-ten.vercel.app/)
- [DEXRegistry on Ropsten (Etherscan)](https://ropsten.etherscan.io/address/0x84e6092Ff9737B5da254A6DB6367F073A78F2fAb)
- [TokenA on Ropsten (Etherscan)](https://ropsten.etherscan.io/address/0xE546a083C0a8C5c2A71b43d4F974EFE14bBc6E49)
- [Pool Creation (TokenA <> TokenB) Transaction on Ropsten (Etherscan)](https://ropsten.etherscan.io/tx/0x5f83186180069908a206ed13468a90b8fa63c457c2f80c33769d6f374c5900c6)
- [Created Pool on Ropsten: TokenA <> TokenB](https://ropsten.etherscan.io/address/0x096b3D271b2D380275458a9F8f1209b9A2C96F69)
- [Generated Typescript types from Smart Contracts](https://github.com/brunoalano/blockchain-developer-bootcamp-final-project/tree/main/packages/swap-app/types/typechain)
- [Mint Transaction](https://ropsten.etherscan.io/tx/0xcdc235d66edda5bcd68c50bd3b132b9501b3e174efec87c4da33faa37b13fe8d)
- [ERC20 Allowance Transaction](https://ropsten.etherscan.io/tx/0x6ec76f493d75966f85c8df78f76cf84c220f9fde0ee58f21e133f59c7a81b1c7)
- [Deposit Liquidity into Smart Contract Transaction](https://ropsten.etherscan.io/tx/0x820894ef799d0a241bd5b5a19570b5a281afdb9c686ab258dfdcb926bcd4f801)
- [**Swap TokenA -> TokenB Transaction**](https://ropsten.etherscan.io/tx/0x0da7f1ef938f3e06cd6939f084f130ca5f286cd2d2e623bc12348650386cbc04)

> **While testing, don't forget to click on "Set Allowance to 100 Tokens" for each token that you want to use on [Pools Page](https://blockchain-developer-bootcamp-final-project-ten.vercel.app/pool).**

_More details on sections below._

## About the Project

#### Objective
The user will be able to exchange between ERC20 tokens through the project interface, only when there is a possible pool to exchange between assets.

In addition, the user can create new ERC20 token pools if they do not exist.

#### Flowchart

**Persona: Buyer**
The buyer will access the solution's web application, and will select the pair of assets they want to exchange. If there is liquidity required for the exchange, an atomic swap will be performed.

**Persona: Liquidity Provider**
The LP may create new liquidity pairs by creating a new pool, or add liquidity to existing pools. He will need to lock assets in the smart contract.

## Deployments

The project was successfully deployed into the **Ropsten** test network. You can see the deployed addresses below:

```
Ropsten Test Net
---------------------------------
TokenA: 0xE546a083C0a8C5c2A71b43d4F974EFE14bBc6E49
TokenB: 0x196A16ee8e52a4f22d1cECaEB0e895a0D0033f37
TokenC: 0x162e4E31Cb88517bE5e321f95f84c1bA801B3Ec0
TokenD: 0x7c187f66755155d92bb16Cc090242E00D438D30a
DEXRegistry: 0x84e6092Ff9737B5da254A6DB6367F073A78F2fAb


Pool Addresses (generated through DEXRegistry) on Ropsten (CREATE2):
--------------------------------------------------------------------

TokenA <> TokenB:
-----------------
Pool Address: 0x096b3D271b2D380275458a9F8f1209b9A2C96F69
Transaction: https://ropsten.etherscan.io/tx/0x5f83186180069908a206ed13468a90b8fa63c457c2f80c33769d6f374c5900c6


TokenC <> TokenA:
-----------------
Pool Address: 0x897138a64fe68bcd73bdaac5be389df5442f6acf
Transaction: https://ropsten.etherscan.io/tx/0x1895ed2e46bd8779d8ff91f2bdb64f21a2412a735ff8425c9dcb5fb017c68ca1
```

## Contracts

Details of the smart contracts:

- Developed using Solidity 0.8.9
- Hardhat with `hardhat-deploy` for easier and more secure deployments
- Using the `etherscan-verify` plugin to validate contracts on Etherscan
- Usage of `Typechain` to generate Typescript bindings for `Ethersv5`
- Unit Tests using Mocha and Waffle
- Using `solhint` to avoid pitfalls
- Hot Reloading using Hardhat and NextJS
- `Multicall` usage for better performance on state interaction

You can check the contracts on the folder `packages/contracts`.

For local deployment, you should run the following commands:

```bash
cd packages/contracts
hh node --watch --export-all ../swap-app/deployments.json
```

This will start the JSON-RPC interface on `http://127.0.0.1:8545/`, deploy all the contracts (also a `Multicall` contract), and export all deployed addresses into the `swap-app/deployments.json` for hot-reloading.

> **While testing, don't forget to click on "Set Allowance to 100 Tokens" for each token that you want to use on [Pools Page](https://blockchain-developer-bootcamp-final-project-ten.vercel.app/pool).**

## Frontend

The frontend was built using:

- NextJS
- Typescript
- Typechain which provide type-safety interface between our contracts and `Ethers`
- Ethers v5
- ChakraUI
- `useDapps` for better **React Hooks** usage with Ethers

The frontend was deployed using Vercel.

To start the local frontend, you should run the following commands:

```bash
cd packages/swap-app
npm run dev
```

The frontend will start on `http://localhost:3000`.