# Blockchain Developer Bootcamp: Final Project

This project will implement an Automated Market Maker (AMM) application based on the Uniswap V2 model.

## Objective

The user will be able to exchange between ERC20 tokens through the project interface, only when there is a possible pool to exchange between assets.

In addition, the user can create new ERC20 token pools if they do not exist.

## Flowchart

**Persona: Buyer**

The buyer will access the solution's web application, and will select the pair of assets they want to exchange. If there is liquidity required for the exchange, an atomic swap will be performed.

**Persona: Liquidity Provider**

The LP may create new liquidity pairs by creating a new pool, or add liquidity to existing pools. He will need to lock assets in the smart contract.

