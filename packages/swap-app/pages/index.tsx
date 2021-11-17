import { useContext } from "react";
import { useEthers } from "@usedapp/core";
import type { NextPage } from "next";
import { DeploymentsContext } from "lib/deployments";
import { HStack, Flex, Container } from "@chakra-ui/react";
import { TokenBalance } from "components/TokenBalance";

const Home: NextPage = () => {
  const deploymentsContext = useContext(DeploymentsContext);
  const { activateBrowserWallet, account, deactivate, library } = useEthers();

  return (
    <Container maxW={"3xl"}>
      <HStack mt={4} w="100%" spacing={8} justify="space-between">
        {typeof library !== "undefined" && deploymentsContext.current !== null && (
          <>
            <TokenBalance
              name="Token A"
              address={deploymentsContext.current.contracts.TokenA.address}
            />
            <TokenBalance
              name="Token B"
              address={deploymentsContext.current.contracts.TokenB.address}
            />
          </>
        )}
      </HStack>
    </Container>
  );
};

export default Home;
