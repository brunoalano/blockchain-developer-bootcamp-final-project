import { expect } from "chai";
import { ethers, deployments, getUnnamedAccounts } from "hardhat";
import { DEXRegistry, Token } from "../typechain";
import { setupUsers } from "./utils";

const setupTest = deployments.createFixture(
  async ({ deployments, getNamedAccounts, ethers }) => {
    // Ensure a fresh deployment
    await deployments.fixture(["DEXRegistry"]);

    // we get an instantiated contract in the form of a ethers.js Contract instance:
    const contracts = {
      DEXRegistry: <DEXRegistry>await ethers.getContract("DEXRegistry"),
      TokenA: <Token>await ethers.getContract("TokenA"),
      TokenB: <Token>await ethers.getContract("TokenB"),
    };

    // we get the tokenOwner
    const { deployer, tokenOwner } = await getNamedAccounts();

    // Get the unnammedAccounts (which are basically all accounts not named in the config,
    // This is useful for tests as you can be sure they have noy been given tokens for example)
    // We then use the utilities function to generate user objects
    // These object allow you to write things like `users[0].Token.transfer(....)`
    const users = await setupUsers(await getUnnamedAccounts(), contracts);

    // Mint TokensA to `tokenOwner`
    const TokenA = <Token>await ethers.getContract("TokenA", deployer);
    await TokenA.mint(
      tokenOwner,
      ethers.BigNumber.from(50).mul(
        ethers.BigNumber.from(await TokenA.decimals()).pow(18)
      )
    ).then((tx) => tx.wait());

    const TokenB = <Token>await ethers.getContract("TokenB", deployer);
    await TokenB.mint(
      tokenOwner,
      ethers.BigNumber.from(100).mul(
        ethers.BigNumber.from(await TokenB.decimals()).pow(18)
      )
    ).then((tx) => tx.wait());

    return {
      ...contracts,
      deployer,
      tokenOwner,
      users,
    };
  }
);

describe("DEX Registry", () => {
  describe("Tokens", () => {
    it("tokenOwner should have TokenA and TokenB", async () => {
      const { TokenA, TokenB, tokenOwner } = await setupTest();

      expect(await TokenA.balanceOf(tokenOwner)).to.equal(
        ethers.BigNumber.from(50).mul(
          ethers.BigNumber.from(await TokenA.decimals()).pow(18)
        )
      );

      expect(await TokenB.balanceOf(tokenOwner)).to.equal(
        ethers.BigNumber.from(100).mul(
          ethers.BigNumber.from(await TokenB.decimals()).pow(18)
        )
      );
    });
  });

  describe("Pool Creation", () => {
    it("Should create a pool when didnt exist", async () => {
      const { DEXRegistry, TokenA, TokenB } = await setupTest();

      expect(
        await DEXRegistry.createPair(TokenA.address, TokenB.address)
      ).to.emit(DEXRegistry, "PairCreated");
    });

    it("Should not create a pool with already existing pair", async () => {
      const { DEXRegistry, TokenA, TokenB } = await setupTest();

      await DEXRegistry.createPair(TokenA.address, TokenB.address);

      await expect(
        DEXRegistry.createPair(TokenB.address, TokenA.address)
      ).to.be.revertedWith("Pool already exists");
    });
  });
});
