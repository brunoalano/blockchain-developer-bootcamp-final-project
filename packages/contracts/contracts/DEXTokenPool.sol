// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEXTokenPool {
    // Store the Registry address
    address public registry;

    // Store the ERC20 Tokens addresses
    address public token0;
    address public token1;

    // Pool Settings
    // -------------------------------------

    // Stores the total amount of share issued for the pool
    uint256 public totalShares;

    // Stores the amount of Token0 locked in the pool
    uint256 public totalToken0;

    // Stores the amount of Token1 locked in the pool
    uint256 public totalToken1;

    // Algorithmic constant used to determine price (k = totalToken0 * totalToken1)
    uint256 public k;

    // Stores the share holding of each provider
    uint256 public constant PRECISION = 1_000_000; // Precision of 6 decimal places for shares
    mapping(address => uint256) public shares;

    // Restricts withdraw, swap feature till liquidity is added to the pool
    modifier activePool() {
        require(totalShares > 0, "Zero Liquidity");
        _;
    }

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
     * Retrieve Pool Details
     */
    function getPoolDetails()
        external
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (totalToken0, totalToken1, totalShares);
    }

    /**
     * Return Estimatives for Token Locking
     */
    function getEquivalentToken0Estimate(uint256 _amountToken1) public view activePool returns (uint256 reqToken0) {
        reqToken0 = (totalToken0 * _amountToken1) / totalToken1;
    }

    function getEquivalentToken1Estimate(uint256 _amountToken0) public view activePool returns (uint256 reqToken1) {
        reqToken1 = (totalToken1 * _amountToken0) / totalToken0;
    }

    /**
     * Add Liquidity into the Pool
     *
     * This method will withdraw the specified amount of tokens
     * from the user and will lock into the pool, receiving the
     * proportional amount of tokens.
     */
    function provide(uint256 _amountToken0, uint256 _amountToken1) external returns (uint256 share) {
        // Check if user allowed us to spend his tokens and has enough
        // tokens
        {
            require(IERC20(token0).balanceOf(msg.sender) >= _amountToken0, "Insufficient Funds of Token0");
            require(IERC20(token1).balanceOf(msg.sender) >= _amountToken1, "Insufficient Funds of Token1");
            uint256 allowance0 = IERC20(token0).allowance(msg.sender, address(this));
            uint256 allowance1 = IERC20(token1).allowance(msg.sender, address(this));
            require(allowance0 >= _amountToken0, "You need allow us to spend token0");
            require(allowance1 >= _amountToken1, "You need allow us to spend token1");
        }

        // Retrieve amount of shares
        if (totalShares == 0) {
            // Genesis liquidity is issued 100 Shares
            share = 100 * PRECISION;
        } else {
            uint256 share0 = (totalShares * _amountToken0) / totalToken0;
            uint256 share1 = (totalShares * _amountToken1) / totalToken1;
            require(share0 == share1, "Equivalent value of tokens not provided...");
            share = share0;
        }

        require(share > 0, "Asset value less than threshold for contribution!");

        // Transfer the tokens to this contract
        IERC20(token0).transferFrom(msg.sender, address(this), _amountToken0);
        IERC20(token1).transferFrom(msg.sender, address(this), _amountToken1);

        totalToken0 += _amountToken0;
        totalToken1 += _amountToken1;
        k = totalToken0 * totalToken1;

        totalShares += share;
        shares[msg.sender] += share;
    }

    // Returns the estimate of Token1 & Token2 that will be released on burning given _share
    function getWithdrawEstimate(uint256 _share)
        public
        view
        activePool
        returns (uint256 amountToken0, uint256 amountToken1)
    {
        require(_share <= totalShares, "Share should be less than totalShare");
        amountToken0 = (_share * totalToken0) / totalShares;
        amountToken1 = (_share * totalToken1) / totalShares;
    }

    // Removes liquidity from the pool and releases corresponding Token1 & Token2 to the withdrawer
    function withdraw(uint256 _share) external activePool returns (uint256 amountToken0, uint256 amountToken1) {
        require(shares[msg.sender] >= _share, "Insuficcient amount of shares");
        (amountToken0, amountToken1) = getWithdrawEstimate(_share);

        shares[msg.sender] -= _share;
        totalShares -= _share;

        totalToken0 -= amountToken0;
        totalToken1 -= amountToken1;
        k = totalToken0 * totalToken1;

        // Transfer Tokens
        require(IERC20(token0).transfer(msg.sender, amountToken0), "Failed transfer token0");
        require(IERC20(token1).transfer(msg.sender, amountToken1), "Failed transfer token1");
    }

    /**
     * Token Swaps
     * ----------------------------------------------
     */

    /**
     * Estimate the Number of Token1 with a specified deposit of Token0
     */
    function getSwapToken0Estimate(uint256 _amountToken0) public view activePool returns (uint256 amountToken1) {
        uint256 token0After = totalToken0 + _amountToken0;
        uint256 token1After = k / token0After;
        amountToken1 = totalToken1 - token1After;

        // To ensure that Token2's pool is not completely depleted leading to inf:0 ratio
        if (amountToken1 == totalToken1) amountToken1--;
    }

    /**
     * Estimate the Required Amount of Token0 to Get a Specified Amount of Token1
     */
    function getSwapToken0EstimateGivenToken1(uint256 _amountToken1)
        public
        view
        activePool
        returns (uint256 amountToken0)
    {
        require(_amountToken1 < totalToken1, "Insufficient pool balance");
        uint256 token1After = totalToken1 / _amountToken1;
        uint256 token0After = k / token1After;
        amountToken0 = token0After - totalToken0;
    }

    /**
     * Swap: Token0 -> Token1
     */
    function swapToken0(uint256 _amountToken0) external activePool returns (uint256 amountToken1) {
        // Check
        require(IERC20(token0).balanceOf(msg.sender) >= _amountToken0, "Insufficient funds");
        require(
            IERC20(token0).allowance(msg.sender, address(this)) >= _amountToken0,
            "You need allow us to spend this amount"
        );

        // Caclulate the amount of tokens to receive
        amountToken1 = getSwapToken0Estimate(_amountToken0);

        // Update the state
        totalToken0 += _amountToken0;
        totalToken1 -= amountToken1;

        // Transfer
        IERC20(token0).transferFrom(msg.sender, address(this), _amountToken0);
        IERC20(token1).transfer(msg.sender, amountToken1);
    }

    /**
     * Estimate the Number of Token0 with a specified deposit of Token1
     */
    function getSwapToken1Estimate(uint256 _amountToken1) public view activePool returns (uint256 amountToken0) {
        uint256 token1After = totalToken1 + _amountToken1;
        uint256 token0After = k / token1After;
        amountToken0 = totalToken0 - token0After;

        // To ensure that Token0's pool is not completely depleted leading to inf:0 ratio
        if (amountToken0 == totalToken0) amountToken0--;
    }

    /**
     * Estimate the Required Amount of Token1 to Get a Specified Amount of Token0
     */
    function getSwapToken1EstimateGivenToken0(uint256 _amountToken0)
        public
        view
        activePool
        returns (uint256 amountToken1)
    {
        require(_amountToken0 < totalToken0, "Insufficient pool balance");
        uint256 token0After = totalToken0 / _amountToken0;
        uint256 token1After = k / token0After;
        amountToken1 = token1After - totalToken1;
    }

    /**
     * Swap: Token1 -> Token0
     */
    function swapToken1(uint256 _amountToken1) external activePool returns (uint256 amountToken0) {
        // Check
        require(IERC20(token1).balanceOf(msg.sender) >= _amountToken1, "Insufficient funds");
        require(
            IERC20(token1).allowance(msg.sender, address(this)) >= _amountToken1,
            "You need allow us to spend this amount"
        );

        // Caclulate the amount of tokens to receive
        amountToken0 = getSwapToken0Estimate(_amountToken1);

        // Update the state
        totalToken1 += _amountToken1;
        totalToken0 -= amountToken0;

        // Transfer
        IERC20(token1).transferFrom(msg.sender, address(this), _amountToken1);
        IERC20(token0).transfer(msg.sender, amountToken0);
    }
}
