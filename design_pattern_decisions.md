# Design Patterns Decision

We implemented a generic `ERC20` token where anyone can mint them. This allow us to create a simple _faucet_, avoiding a "admin" wallet to release funds.

On `DEXRegistry`, we use the `CREATE2` method to create deterministic pools addresses, which themselves are contracts. This allow us to reference in local state only pools that complain with the deployed bytecode, avoiding attacks.

On `DEXTokenPool`, many of our functions are designed to avoid reentrancy attack, specially because this is a DeFi instrument. The biggest security issue was to withdraw shares and tokens, where we avoid that using the design pattern of interaction-changes-effect.

We use the `Access Control Design Patterns` using the OpenZeppelin Library for `Owner`.