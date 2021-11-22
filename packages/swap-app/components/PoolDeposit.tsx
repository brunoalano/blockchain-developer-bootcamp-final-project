import {
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import {
  useDebounce,
  useEthers,
  useTokenAllowance,
  useTokenBalance,
} from "@usedapp/core";
import { TokenInfo } from "@usedapp/core/dist/esm/src/model/TokenInfo";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { DEXTokenPool__factory } from "types/typechain";

interface PoolDepositProps {
  pool: string;
  token0: string;
  token1: string;
  token0Details: TokenInfo;
  token1Details: TokenInfo;
  totalShares: BigNumber;
}

export const PoolDeposit: React.FC<PoolDepositProps> = ({
  pool,
  token0,
  token1,
  token0Details,
  token1Details,
  totalShares,
}) => {
  const { account, library } = useEthers();

  // Inputs
  const [token0Input, setToken0Input] = useState<number>(0);
  const [token1Input, setToken1Input] = useState<number>(0);
  const [lastChangedInput, setLastChangedInput] = useState<
    "token0" | "token1" | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const debouncedToken0Input = useDebounce(token0Input, 1000);
  const debouncedToken1Input = useDebounce(token1Input, 1000);

  // Tokens Balances
  const token0Balance = useTokenBalance(token0, account!);
  const token1Balance = useTokenBalance(token1, account!);

  // Tokens allowances
  const token0Allowance = useTokenAllowance(token0, account!, pool);
  const token1Allowance = useTokenAllowance(token1, account!, pool);

  // Calculate the corresponding amount
  useEffect(() => {
    if (totalShares.eq(0)) return;

    async function calculate() {
      setIsLoading(true);

      const c = DEXTokenPool__factory.connect(
        pool,
        library!.getSigner(account!)
      );

      if (lastChangedInput === "token0") {
        // Calculate based on provided token0
        const requiredToken1 = parseFloat(
          formatUnits(
            await c.getEquivalentToken1Estimate(
              BigNumber.from(token0Input).mul(
                BigNumber.from(10).pow(token0Details.decimals || 18)
              )
            ),
            18
          )
        );
        setToken1Input(requiredToken1);
      } else if (lastChangedInput === "token1") {
        const requiredToken0 = parseFloat(
          formatUnits(
            await c.getEquivalentToken0Estimate(
              BigNumber.from(token1Input).mul(
                BigNumber.from(10).pow(token1Details.decimals || 18)
              )
            ),
            18
          )
        );
        setToken0Input(requiredToken0);
      }

      setIsLoading(false);
    }

    if (lastChangedInput === "token0" || lastChangedInput === "token1") {
      setIsLoading(true);
      calculate();
    }
  }, [debouncedToken0Input, debouncedToken1Input]);

  const deposit = async () => {
    setIsLoading(true);
    const c = DEXTokenPool__factory.connect(pool, library!.getSigner(account!));
    await c.provide(
      BigNumber.from(token0Input).mul(
        BigNumber.from(10).pow(token0Details.decimals || 18)
      ),
      BigNumber.from(token1Input).mul(
        BigNumber.from(10).pow(token1Details.decimals || 18)
      )
    );
    setIsLoading(false);
  };

  return (
    <Box mt={6}>
      <Heading size="lg">Deposit</Heading>
      <Divider mt={2} pb={2} mb={4} />
      <HStack>
        <FormControl>
          <FormLabel>{token0Details.name}</FormLabel>
          <NumberInput
            defaultValue={0}
            min={0}
            max={
              token0Balance &&
              token0Balance
                .div(
                  BigNumber.from("10").pow(
                    BigNumber.from(token0Details.decimals || 18)
                  )
                )
                .toNumber()
            }
            value={token0Input}
            onChange={(e) => {
              setToken0Input(parseFloat(e));
              setLastChangedInput("token0");
            }}
          >
            <NumberInputField />
          </NumberInput>
          <FormHelperText>
            <p>
              Max:{" "}
              {token0Balance &&
                formatUnits(token0Balance, token0Details.decimals || 18)}
            </p>
            <p>
              Allowance:{" "}
              {token0Allowance &&
                formatUnits(token0Allowance, token0Details.decimals || 18)}
            </p>
          </FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>{token1Details.name}</FormLabel>
          <NumberInput
            defaultValue={0}
            min={0}
            max={
              token1Balance &&
              token1Balance
                .div(
                  BigNumber.from("10").pow(
                    BigNumber.from(token1Details.decimals || 18)
                  )
                )
                .toNumber()
            }
            value={token1Input}
            onChange={(e) => {
              setToken1Input(parseFloat(e));
              setLastChangedInput("token1");
            }}
          >
            <NumberInputField />
          </NumberInput>
          <FormHelperText>
            <p>
              Max:{" "}
              {token1Balance &&
                formatUnits(token1Balance, token1Details.decimals || 18)}
            </p>
            <p>
              Allowance:{" "}
              {token1Allowance &&
                formatUnits(token1Allowance, token1Details.decimals || 18)}
            </p>
          </FormHelperText>
        </FormControl>
      </HStack>

      <Button
        isFullWidth
        colorScheme="blue"
        size="lg"
        mt={4}
        isLoading={isLoading}
        onClick={() => deposit()}
      >
        Deposit
      </Button>
    </Box>
  );
};
