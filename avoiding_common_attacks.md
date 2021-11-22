# Avoiding Common Attacks

### `DEXTokenPool`

1. On the `provide` function, which adds liquidity into our pool, we avoid reentrancy attack using the security design pattern of interact-changes-effect.
2. On the `withdraw` we also avoid reentrancy attack using the same pattern.

### `DEXRegistry`

1. We use `CREATE2` ensuring that only it can create and use pools
2. We use the OpenZeppelin `Owner` to guarantee that only our account can make changes
3. The contract it's not upgradable by design, avoiding exploits

### General

1. Specific pragma version
2. Usage of modifiers
3. Secure ERC20 Transfer interaction