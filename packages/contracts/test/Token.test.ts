import { expect } from "chai";

// We import the hardhat environment field we are planning to use
import {
  ethers,
  deployments,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";

// we import our utilities
import { setupUsers, setupUser } from "./utils";

// we create a setup function that can be called by every test and setup variable for easy to read tests
async function setup() {
  // it first ensures the deployment is executed and reset (use of evm_snapshot for faster tests)
  await deployments.fixture(["ERC20Tokens"]);

  // we get an instantiated contract in the form of a ethers.js Contract instance:
  const contracts = {
    TokenA: await ethers.getContract("TokenA"),
    TokenB: await ethers.getContract("TokenB"),
  };

  // we get the tokenOwner
  const { deployer } = await getNamedAccounts();

  // Get the unnammedAccounts (which are basically all accounts not named in the config,
  // This is useful for tests as you can be sure they have noy been given tokens for example)
  // We then use the utilities function to generate user objects
  // These object allow you to write things like `users[0].Token.transfer(....)`
  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  // finally we return the whole object (including the tokenOwner setup as a User object)
  return {
    ...contracts,
    users,
    tokenOwner: await setupUser(deployer, contracts),
  };
}

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Token contract", () => {
  // You can nest describe calls to create subsections.
  describe("Deployment", () => {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async () => {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // before the test, we call the fixture function.
      // while mocha have hooks to perform these automatically, they force you to declare the variable in greater scope which can introduce subttle errors
      // as such we prefers to have the setup called right at the beginning of the test. this also allow yout o name it accordingly for easier to read tests.
      const { TokenA, TokenB } = await setup();

      // This test expects the owner variable stored in the contract to be equal to our configured owner
      const { deployer } = await getNamedAccounts();

      expect(await TokenA.owner()).to.equal(deployer);
      expect(await TokenB.owner()).to.equal(deployer);
    });
  });

  describe("Transactions", () => {
    it("Should fail if sender doesn’t have enough tokens", async () => {
      const { TokenA, users, tokenOwner } = await setup();
      const initialOwnerBalance = await TokenA.balanceOf(tokenOwner.address);

      // Try to send 1 token from users[0] (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        users[0].TokenA.transfer(tokenOwner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await TokenA.balanceOf(tokenOwner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});
