// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEXTokenPool {
    // Store the Registry address
    address public registry;

    // Store the ERC20 Tokens addresses
    address public token0;
    address public token1;

    // Store the reserves of each token
    uint256 public reserves0;
    uint256 public reserves1;

    // Store the contribution of each user in this pool
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    /**
     * DEXTokenPool Constructor
     *
     * This contract will be built by `DEXRegistry`, so we need to
     * assign it as a registry rulling this pool.
     */
    constructor() {
        registry = msg.sender;
    }

    /**
     * Initialize the Pool
     *
     * Since this contract will be deployed by `DEXRegistry`, we cannot pass
     * information to the constructor method. We will call this method once to
     * assign the token addresses to this pool.
     */
    function initialize(address _token0, address _token1) external {
        require(token0 == address(0) && token1 == address(0), "Already initialized");
        token0 = _token0;
        token1 = _token1;
    }

    /**
     * Calculate the Constant Product Formula
     *
     * This will calculate the required number of TokenB to keep the
     * ratio of reserveA and reserveB constant.
     */
    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) internal pure returns (uint256 amountB) {
        require(reserveA > 0 && reserveB > 0, "No Liquidity on Pool");
        amountB = (amountA * reserveB) / reserveA;
    }

    /**
     * Calculate the Liquidity Ratio
     *
     * This method will return the correct amount of tokens that should
     * be sent to the pool to keep the correct ratio.
     *
     * If no liquidity was addded the pool, will set the ratio in the
     * first call.
     */
    function calculateAddLiquidityRatio(
        uint256 amount0,
        uint256 amount1,
        bool token0IsPriority
    ) public view returns (uint256 correctedAmount0, uint256 correctedAmount1) {
        // Check if is the first call on this pool
        if (reserves0 == 0 && reserves1 == 0) {
            (correctedAmount0, correctedAmount1) = (amount0, amount1);
        } else {
            // @TODO: Set the correct usage of `token0IsPriority` when token1 should be the priority
            uint256 amount1Optimal = quote(amount0, reserves0, reserves1);
            if (token0IsPriority && amount1Optimal <= amount1) {
                (correctedAmount0, correctedAmount1) = (amount0, amount1Optimal);
            } else {
                uint256 amount0Optimal = quote(amount1, reserves1, reserves0);
                assert(amount0Optimal <= amount0);
                (correctedAmount0, correctedAmount1) = (amount0Optimal, amount1);
            }
        }
    }

    /**
     * Add Liquidity to Pool
     *
     * You should select if you want to give priority for the correct amount of
     * token0 or token1 using the `token0IsPriority` flag. The other token will
     * be adapted to keep the correct ratio if pool already with liquidity.
     */
    function deposit(
        uint256 amount0,
        uint256 amount1,
        bool token0IsPriority
    ) public returns (uint256 correctAmount0, uint256 correctAmount1) {
        // Validation
        require(amount0 > 0 && amount1 > 0, "You need to supply both tokens");

        // Check if user allowed us to spend his tokens
        uint256 allowance0 = IERC20(token0).allowance(msg.sender, address(this));
        uint256 allowance1 = IERC20(token1).allowance(msg.sender, address(this));
        require(allowance0 >= amount0, "You need allow us to spend token0");
        require(allowance1 >= amount1, "You need allow us to spend token1");

        // Calculate the correct amount of tokens to deposit
        (correctAmount0, correctAmount1) = calculateAddLiquidityRatio(amount0, amount1, token0IsPriority);

        // Transfer the tokens to this contract
        IERC20(token0).transferFrom(msg.sender, address(this), correctAmount0);
        IERC20(token1).transferFrom(msg.sender, address(this), correctAmount1);

        // Add user contribution to the pool
        uint256 liquidity;
        uint256 _totalLiquidity = totalLiquidity;
        if (_totalLiquidity == 0) {
            liquidity = Math.sqrt(correctAmount0 * correctAmount1);
        } else {
            liquidity = Math.min(
                (correctAmount0 * _totalLiquidity) / reserves0,
                (correctAmount1 * _totalLiquidity) / reserves1
            );
        }
        liquidity[msg.sender] += liquidity;
        totalLiquidity += liquidity;

        // Update the reserves
        reserves0 += correctAmount0;
        reserves1 += correctAmount1;
    }
}
