import React, { useContext } from "react";
import type { NextPage } from "next";
import { DeploymentsContext } from "lib/deployments";
import { Interface } from "@ethersproject/abi";
import { useContractCall } from "@usedapp/core";
import { DEXRegistry__factory } from "types/typechain";
import { Container, Heading, VStack } from "@chakra-ui/react";
import { PoolInfo } from "components/PoolInfo";

const Pool: NextPage = () => {
  const deploymentsContext = useContext(DeploymentsContext);

  // Read all existing pools
  const [allPools] =
    useContractCall(
      deploymentsContext.current && {
        abi: new Interface(DEXRegistry__factory.abi),
        address: deploymentsContext.current!.contracts.DEXRegistry.address,
        method: "allPools",
        args: [],
      }
    ) ?? [];

  return (
    <Container maxW={"6xl"} mt={6}>
      <Heading>Pools</Heading>
      <VStack spacing={8}>
        {allPools &&
          allPools.map((poolAddress: string) => (
            <PoolInfo key={poolAddress} address={poolAddress} />
          ))}
      </VStack>
    </Container>
  );
};

export default Pool;
