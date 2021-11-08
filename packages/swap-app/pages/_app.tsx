import { createContext } from "react";
import type { AppProps } from "next/app";
import { ChainId, DAppProvider, FullConfig } from "@usedapp/core";
import deployments from "deployments.json";
import { createDeploymentSettings, DeploymentsContext } from "lib/deployments";

const deploymentSettings =
  createDeploymentSettings<typeof deployments>(deployments);

const config: Partial<FullConfig> = {
  readOnlyChainId: ChainId.Localhost,
  readOnlyUrls: {
    [ChainId.Localhost]: "http://127.0.0.1:8545",
  },
  multicallAddresses: {
    [ChainId.Localhost]:
      deploymentSettings[ChainId.Localhost]?.contracts.Multicall.address || "",
  },
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DeploymentsContext.Provider value={deploymentSettings}>
      <DAppProvider config={config}>
        <Component {...pageProps} />
      </DAppProvider>
    </DeploymentsContext.Provider>
  );
}

export default MyApp;
