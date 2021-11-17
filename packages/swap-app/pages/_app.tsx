import type { AppProps } from "next/app";
import { ChainId, DAppProvider, FullConfig } from "@usedapp/core";
import { ChakraProvider } from "@chakra-ui/react";
import deployments from "deployments.json";
import { createDeploymentSettings, DeploymentsProvider } from "lib/deployments";
import { Header } from "components/Header";
import theme from "lib/theme";

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
    <ChakraProvider theme={theme}>
      <DAppProvider config={config}>
        <DeploymentsProvider settings={deploymentSettings}>
          <Header />
          <Component {...pageProps} />
        </DeploymentsProvider>
      </DAppProvider>
    </ChakraProvider>
  );
}

export default MyApp;
