import React from "react";
import type { NextPage } from "next";
import {
  Box,
  Container,
  Divider,
  Heading,
  HStack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";
import { useContractCalls, useEthers, useToken } from "@usedapp/core";
import { Interface } from "@ethersproject/abi";
import { DEXTokenPool__factory } from "types/typechain";
import { useRouter } from "next/router";
import { formatUnits } from "ethers/lib/utils";
import { PoolDeposit } from "components/PoolDeposit";

const Pool: NextPage = () => {
  const router = useRouter();
  const { pool } = router.query;

  const { account, library } = useEthers();
  const baseContractCall = {
    abi: new Interface(DEXTokenPool__factory.abi),
    address: pool as string,
  };

  const [token0, token1, details, shares] = useContractCalls([
    { ...baseContractCall, method: "token0", args: [] },
    { ...baseContractCall, method: "token1", args: [] },
    { ...baseContractCall, method: "getPoolDetails", args: [] },
    account && { ...baseContractCall, method: "shares", args: [account] },
  ]);

  const token0Details = useToken(typeof token0 !== "undefined" && token0[0]);
  const token1Details = useToken(typeof token1 !== "undefined" && token1[0]);

  const withdraw = async () => {
    if (typeof shares === "undefined") {
      alert("Error");
      return;
    }

    const c = DEXTokenPool__factory.connect(
      pool as string,
      library!.getSigner(account!)
    );
    await c.withdraw(shares[0]);
  };

  return (
    <Container maxW={"6xl"} mt={6}>
      <Heading>Pool Details</Heading>
      <Divider py={2} />
      <HStack mt={4}>
        <Box w="100%" py={4} px={4} border="1px solid black">
          <Heading size="md">Token0</Heading>
          <Divider pb={2} mb={2} />
          <StatGroup>
            <Stat>
              <StatLabel>Name</StatLabel>
              <StatNumber>{token0Details?.name}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Symbol</StatLabel>
              <StatNumber>{token0Details?.symbol}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Decimals</StatLabel>
              <StatNumber>{token0Details?.decimals}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>On Pool</StatLabel>
              <StatNumber>
                {details && formatUnits(details[0], token0Details?.decimals)}
              </StatNumber>
            </Stat>
          </StatGroup>
        </Box>

        <Box w="100%" py={4} px={4} border="1px solid black">
          <Heading size="md">Token1</Heading>
          <Divider pb={2} mb={2} />
          <StatGroup>
            <Stat>
              <StatLabel>Name</StatLabel>
              <StatNumber>{token1Details?.name}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Symbol</StatLabel>
              <StatNumber>{token1Details?.symbol}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Decimals</StatLabel>
              <StatNumber>{token1Details?.decimals}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>On Pool</StatLabel>
              <StatNumber>
                {details && formatUnits(details[1], token1Details?.decimals)}
              </StatNumber>
            </Stat>
          </StatGroup>
        </Box>
      </HStack>

      {account && (
        <Box w="100%" py={4} px={4} border="1px solid black" mt={4}>
          <Heading size="md">Data for Account (yours): {account}</Heading>
          <Divider pb={2} mb={2} />
          <StatGroup>
            <Stat>
              <StatLabel>Your shares</StatLabel>
              <StatNumber>
                {shares && formatUnits(shares[0], 6)}
                <Button
                  ml={4}
                  size="xs"
                  colorScheme="blue"
                  onClick={() => withdraw()}
                >
                  Withdraw
                </Button>
              </StatNumber>
            </Stat>
          </StatGroup>
        </Box>
      )}

      {typeof account === "undefined" ||
      account === null ||
      typeof library === "undefined" ||
      typeof token0 === "undefined" ||
      typeof token1 === "undefined" ||
      typeof token0Details === "undefined" ||
      typeof token1Details === "undefined" ||
      typeof details === "undefined" ? (
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Connect your wallet</AlertTitle>
          <AlertDescription>
            To deposit or withdraw, you should connect before.
          </AlertDescription>
        </Alert>
      ) : (
        <PoolDeposit
          pool={pool as string}
          token0={token0[0]}
          token1={token1[0]}
          token0Details={token0Details}
          token1Details={token1Details}
          totalShares={details[2]}
        />
      )}
    </Container>
  );
};

export default Pool;
