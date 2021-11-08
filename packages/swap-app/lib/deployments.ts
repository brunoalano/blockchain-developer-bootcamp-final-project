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

export const DeploymentsContext = createContext<ExportedDeployments>({});

export function createDeploymentSettings<T>(obj: T): ExportedDeployments {
  const deploymentsSettings: ExportedDeployments = {};

  Object.keys(obj).map((k) => {
    deploymentsSettings[Number(k) as ChainId] = Object.values(
      obj[k as keyof T]
    )[0] as ExportedNetworkDeployment;
  });

  return deploymentsSettings;
}
