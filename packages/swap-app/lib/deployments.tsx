import { ChainId, useEthers } from "@usedapp/core";
import { createContext, FC } from "react";
import deployments from "deployments.json";

const availableContracts = deployments[1337].localhost.contracts;
type DeploymentContracts = keyof typeof availableContracts;

export type ExportedDeploymentContract = {
  address: string;
  abi: any;
};

export type ExportedNetworkDeployment = {
  name: string;
  chainId: string;
  contracts: {
    [contractName in DeploymentContracts]: ExportedDeploymentContract;
  };
};

export type ExportedDeployments = Partial<{
  [key in ChainId]: ExportedNetworkDeployment;
}>;

interface ExportedDeploymentsWithCurrent extends ExportedDeployments {
  current: ExportedNetworkDeployment | null;
}

export const DeploymentsContext = createContext<ExportedDeploymentsWithCurrent>(
  {
    current: null,
  }
);

export function createDeploymentSettings<T>(obj: T): ExportedDeployments {
  const deploymentsSettings: ExportedDeployments = {};

  Object.keys(obj).map((k) => {
    deploymentsSettings[Number(k) as ChainId] = Object.values(
      obj[k as keyof T]
    )[0] as ExportedNetworkDeployment;
  });

  return deploymentsSettings;
}

interface DeploymentsProviderProps {
  settings: ExportedDeployments;
}

export const DeploymentsProvider: FC<DeploymentsProviderProps> = ({
  children,
  settings,
}) => {
  const { chainId } = useEthers();

  const value: ExportedDeploymentsWithCurrent = {
    ...settings,
    current:
      typeof chainId !== "undefined" && typeof settings[chainId] !== "undefined"
        ? settings[chainId]!
        : null,
  };

  return (
    <DeploymentsContext.Provider value={value}>
      {children}
    </DeploymentsContext.Provider>
  );
};
