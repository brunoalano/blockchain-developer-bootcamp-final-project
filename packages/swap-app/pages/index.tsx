import React, { useCallback, useContext, useEffect, useState } from "react";
import { useContractCall, useEthers } from "@usedapp/core";
import type { NextPage } from "next";
import { DeploymentContracts, DeploymentsContext } from "lib/deployments";
import {
  Container,
  Stack,
  useColorModeValue,
  Heading,
  Divider,
  Select,
  FormControl,
  FormLabel,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import { AddressZero } from "@ethersproject/constants";
import {
  DEXRegistry,
  DEXRegistry__factory,
  DEXTokenPool__factory,
} from "types/typechain";
import { useContractFunction } from "lib/utils";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const deploymentsContext = useContext(DeploymentsContext);
  const { library, account } = useEthers();
  const router = useRouter();

  const [inputTokenAddress, setInputTokenAddress] = useState<string | null>(
    null
  );
  const [outputTokenAddress, setOutputTokenAddress] = useState<string | null>(
    null
  );

  const [orderedPoolTokens, setOrderedPoolTokens] = useState<
    [string, string] | null
  >(null);

  const tokens =
    deploymentsContext.current !== null
      ? Object.keys(deploymentsContext.current.contracts)
          .filter((k) => k.indexOf("Token") > -1)
          .map((k) => [
            k,
            deploymentsContext.current!.contracts[k as DeploymentContracts]
              .address,
          ])
      : [];

  // Update token0 and token1
  useEffect(() => {
    if (
      inputTokenAddress === null ||
      inputTokenAddress === "" ||
      outputTokenAddress === null ||
      outputTokenAddress === ""
    ) {
      return;
    }

    // Find the `token0` and `token1`
    const inputTokenIsToken0 = BigNumber.from(inputTokenAddress).lt(
      BigNumber.from(outputTokenAddress)
    );
    const [token0, token1] = inputTokenIsToken0
      ? [inputTokenAddress, outputTokenAddress]
      : [outputTokenAddress, inputTokenAddress];

    setOrderedPoolTokens([token0, token1]);
  }, [inputTokenAddress, outputTokenAddress]);

  // Query the Smart Contract
  const [poolAddress] =
    useContractCall(
      orderedPoolTokens &&
        deploymentsContext.current && {
          abi: new Interface(DEXRegistry__factory.abi),
          address: deploymentsContext.current?.contracts.DEXRegistry.address,
          method: "registry",
          args: orderedPoolTokens,
        }
    ) ?? [];

  /**
   * Create a New Pool
   */
  const createPool = async (token0: string, token1: string) => {
    if (deploymentsContext.current === null || typeof library === "undefined")
      return;

    const c = DEXRegistry__factory.connect(
      deploymentsContext.current!.contracts.DEXRegistry.address,
      library!.getSigner()
    );
    const resp = await c.createPair(token0, token1);
    console.log("response", resp);
  };

  return (
    <Container maxW={"6xl"}>
      <Stack
        spacing={4}
        w={"full"}
        maxW={"lg"}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"lg"}
        rounded={"lg"}
        p={6}
        my={12}
        mx="auto"
      >
        <Heading fontSize={"lg"}>Swap</Heading>
        <Divider my={4} />
        <FormControl id="inputToken">
          <FormLabel>Input Token</FormLabel>
          <Select
            placeholder="Select a input token"
            onChange={(e) => setInputTokenAddress(e.target.value)}
          >
            {tokens.map((token) => (
              <option key={token[0]} value={token[1]}>
                {token[0]}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="outputToken">
          <FormLabel>Output Token</FormLabel>
          <Select
            placeholder="Select a output token"
            onChange={(e) => setOutputTokenAddress(e.target.value)}
          >
            {tokens
              .filter((t) => t[1] !== inputTokenAddress)
              .map((token) => (
                <option key={token[0]} value={token[1]}>
                  {token[0]}
                </option>
              ))}
          </Select>
        </FormControl>

        <Divider my={4} />

        {poolAddress === AddressZero && (
          <>
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>Pool not found!</AlertTitle>
              <AlertDescription>You need to create this pool.</AlertDescription>
            </Alert>

            <Button
              colorScheme="blue"
              size="lg"
              isFullWidth
              disabled={account === null || typeof account === "undefined"}
              onClick={() => {
                if (orderedPoolTokens !== null) {
                  createPool(orderedPoolTokens[0], orderedPoolTokens[1]);
                }
              }}
            >
              Create Pool
            </Button>
          </>
        )}

        <Button
          colorScheme="blue"
          size="lg"
          rightIcon={<ArrowForwardIcon />}
          isFullWidth
          disabled={
            typeof poolAddress === "undefined" ||
            poolAddress === AddressZero ||
            account === null ||
            typeof account === "undefined"
          }
          onClick={() => {
            router.push(
              `/swap?pool=${encodeURIComponent(
                poolAddress
              )}&inputToken=${encodeURIComponent(
                inputTokenAddress || ""
              )}&outputToken=${encodeURIComponent(outputTokenAddress || "")}`
            );
          }}
        >
          Next
        </Button>
      </Stack>
    </Container>
  );
};

export default Home;
