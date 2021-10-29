import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("TokenA", {
    contract: "Token",
    from: deployer,
    args: ["TokenA", "TKA"],
    log: true,
  });

  await deploy("TokenB", {
    contract: "Token",
    from: deployer,
    args: ["TokenB", "TKB"],
    log: true,
  });
};
export default func;
func.tags = ["ERC20Tokens"];
