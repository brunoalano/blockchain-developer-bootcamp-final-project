import React, { useContext } from "react";
import { Container, HStack } from "@chakra-ui/react";
import type { NextPage } from "next";
import { DeploymentsContext, ExportedNetworkDeployment } from "lib/deployments";
import { useEthers } from "@usedapp/core";
import { TokenBalance } from "components/TokenBalance";

interface ERC20TokensProps {
  network: ExportedNetworkDeployment;
}

const ERC20Tokens: React.FC<ERC20TokensProps> = ({ network }) => {
  // Retrieve a list of tokens
  const tokens = Object.keys(network.contracts).filter(
    (k) => k.indexOf("Token") > -1
  );

  return (
    <div>
      <HStack mt={4} w="100%" spacing={8} justify="space-between">
        {tokens.map((token) => (
          <TokenBalance
            key={token}
            name={token}
            address={
              network.contracts[token as keyof typeof network.contracts].address
            }
          />
        ))}
      </HStack>
    </div>
  );
};

const Faucet: NextPage = () => {
  const deploymentsContext = useContext(DeploymentsContext);
  const { library, account } = useEthers();

  return (
    <Container maxW={"6xl"}>
      {typeof deploymentsContext.current === null ||
      account === null ||
      typeof account === "undefined" ||
      typeof library === "undefined" ? (
        <div>Connect your wallet before</div>
      ) : (
        <div>
          <ERC20Tokens network={deploymentsContext.current!} />
        </div>
      )}
    </Container>
  );
};

export default Faucet;
