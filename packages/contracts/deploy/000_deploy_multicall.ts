import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("Multicall", {
    from: deployer,
    args: [],
    log: true,
  });
};
export default func;
func.tags = ["Multicall"];

func.skip = async (hre) => {
  const currentChain = await hre.getChainId();

  // Deploy only to localhost
  return currentChain !== "1337";
};
