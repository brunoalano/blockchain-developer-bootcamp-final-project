import {
  Button,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  NumberInput,
  NumberInputField,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { BigNumber } from "@ethersproject/bignumber";
import {
  useContractCall,
  useContractCalls,
  useDebounce,
  useEthers,
  useToken,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { formatUnits, Interface } from "ethers/lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { DEXTokenPool__factory } from "types/typechain";

type QueryStringProps = {
  pool: string;
  inputToken: string;
  outputToken: string;
};

const Swap: NextPage = () => {
  const router = useRouter();
  const { pool, inputToken, outputToken } = router.query as QueryStringProps;
  const { account, library } = useEthers();

  // Load pool details
  const baseContractCall = {
    abi: new Interface(DEXTokenPool__factory.abi),
    address: pool as string,
  };
  const [token0] =
    useContractCall({
      abi: new Interface(DEXTokenPool__factory.abi),
      address: pool as string,
      method: "token0",
      args: [],
    }) ?? [];

  // Load tokens data
  const inputTokenBalance = useTokenBalance(inputToken, account);
  const inputTokenAllowance = useTokenAllowance(inputToken, account, pool);

  // Token Details
  const inputTokenDetails = useToken(inputToken);
  const outputTokenDetails = useToken(outputToken);

  // Inputs
  const [inputAmount, setInputAmount] = useState<number>(0);
  const [outputAmount, setOutputAmount] = useState<string | null>(null);
  const [isLoadingOutput, setIsLoadingOutput] = useState<boolean>(false);
  const debouncedInput = useDebounce(inputAmount, 1000);

  // Calculate the expected amount
  useEffect(() => {
    if (
      typeof library === "undefined" ||
      typeof account === "undefined" ||
      account === null ||
      typeof token0 === "undefined"
    )
      return;

    async function calculateOutput() {
      const c = DEXTokenPool__factory.connect(
        pool,
        library!.getSigner(account!)
      );
      const inputIsToken0 = inputToken === token0;

      // Parsed value
      const parsedInput = BigNumber.from(debouncedInput).mul(
        BigNumber.from(10).pow(inputTokenDetails?.decimals || 18)
      );

      const expectedOutput = await (inputIsToken0
        ? c.getSwapToken0Estimate(parsedInput)
        : c.getSwapToken1Estimate(parsedInput));
      setOutputAmount(
        formatUnits(expectedOutput, outputTokenDetails?.decimals || 18)
      );
      setIsLoadingOutput(false);
    }

    setIsLoadingOutput(true);
    calculateOutput();
  }, [debouncedInput, library, account, token0]);

  const swap = async () => {
    const c = DEXTokenPool__factory.connect(pool, library!.getSigner(account!));
    const inputIsToken0 = inputToken === token0;

    // Parsed value
    const parsedInput = BigNumber.from(debouncedInput).mul(
      BigNumber.from(10).pow(inputTokenDetails?.decimals || 18)
    );

    // Swap
    const swapTx = await (inputIsToken0
      ? c.swapToken0(parsedInput)
      : c.swapToken1(parsedInput));
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

        <FormControl>
          <FormLabel>Input: {inputTokenDetails?.name}</FormLabel>
          <NumberInput
            defaultValue={0}
            min={0}
            max={
              inputTokenBalance &&
              inputTokenBalance
                .div(
                  BigNumber.from("10").pow(
                    BigNumber.from(inputTokenDetails?.decimals || 18)
                  )
                )
                .toNumber()
            }
            value={inputAmount}
            onChange={(e) => setInputAmount(parseFloat(e))}
          >
            <NumberInputField />
          </NumberInput>
          <FormHelperText>
            Max:{" "}
            {inputTokenBalance &&
              formatUnits(inputTokenBalance, inputTokenDetails?.decimals || 18)}
          </FormHelperText>
        </FormControl>

        <Divider my={4} />

        <FormControl>
          <FormLabel>Output: {outputTokenDetails?.name}</FormLabel>
          {isLoadingOutput ? <Spinner /> : <Text>{outputAmount}</Text>}
        </FormControl>

        <Divider my={4} />

        {inputTokenAllowance &&
          BigNumber.from(inputAmount).gt(inputTokenAllowance) && (
            <div>
              <p>Increase the allowance on Pools page</p>
            </div>
          )}

        <Button
          isFullWidth
          size="lg"
          colorScheme="blue"
          disabled={
            isLoadingOutput ||
            outputAmount === null ||
            outputAmount === "0.0" ||
            typeof account === "undefined" ||
            account === null
          }
          onClick={() => swap()}
        >
          Swap
        </Button>
      </Stack>
    </Container>
  );
};

export default Swap;
