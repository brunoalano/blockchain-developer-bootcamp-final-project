// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "./DEXTokenPool.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEXRegistry is Ownable {
    // Store the Tokens Pool's Location
    mapping(address => mapping(address => address)) public registry;

    // Store the pool's locations
    address[] public pools;

    // Event triggered when a new pair is created
    event PairCreated(address indexed token0, address indexed token1, address pair, uint256);

    /**
     * Return Total Number of Pools created
     */
    function countPools() external view returns (uint256) {
        return pools.length;
    }

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "Must be different tokens");
        require(tokenA != address(0), "Invalid Token");

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(registry[token0][token1] == address(0), "Pool already exists");

        bytes memory bytecode = type(DEXTokenPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));

        // solhint-disable-next-line no-inline-assembly
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        DEXTokenPool(pair).initialize(token0, token1);

        registry[token0][token1] = pair;
        registry[token1][token0] = pair;
        pools.push(pair);

        // Send a new event for frontend
        emit PairCreated(token0, token1, pair, pools.length);
    }
}
