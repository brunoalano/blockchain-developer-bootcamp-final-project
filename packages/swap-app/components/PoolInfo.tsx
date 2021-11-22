import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Link,
  useColorModeValue,
  Text,
  Spinner,
  HStack,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  StatHelpText,
} from "@chakra-ui/react";
import { Interface } from "@ethersproject/abi";
import {
  useContractCalls,
  useEthers,
  useToken,
  useTokenAllowance,
} from "@usedapp/core";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { DeploymentsContext } from "lib/deployments";
import React, { useContext } from "react";
import { DEXTokenPool__factory, Token__factory } from "types/typechain";
import NextLink from "next/link";

const TokenName: React.FC<{ address: string }> = ({ address }) => {
  const tokenInfo = useToken(address);

  return (
    <Text
      fontSize="2xl"
      color={useColorModeValue("gray.700", "white")}
      fontWeight="700"
    >
      {tokenInfo?.name}
    </Text>
  );
};

const MyTokenInfo: React.FC<{
  name: string;
  address: string;
  account: string;
  spender: string;
}> = ({ address, account, spender, name }) => {
  const { library } = useEthers();
  const allowance = useTokenAllowance(address, account, spender);

  const setAllowance = async () => {
    const c = Token__factory.connect(address, library!.getSigner(account));
    await c.approve(spender, parseUnits("100.0", 18));
  };

  return (
    <Stat mt={4}>
      <StatLabel>Your {name} Remaining Allowance</StatLabel>
      <StatNumber>{allowance && formatUnits(allowance, 18)}</StatNumber>
      <StatHelpText cursor="pointer" onClick={() => setAllowance()}>
        Set Allowance to 100 Tokens
      </StatHelpText>
    </Stat>
  );
};

interface PoolInfoProps {
  address: string;
}

export const PoolInfo: React.FC<PoolInfoProps> = ({ address }) => {
  const deploymentsContext = useContext(DeploymentsContext);
  const { account } = useEthers();
  const baseContractCall = {
    abi: new Interface(DEXTokenPool__factory.abi),
    address: address,
  };

  const [token0, token1, details] = useContractCalls([
    { ...baseContractCall, method: "token0", args: [] },
    { ...baseContractCall, method: "token1", args: [] },
    { ...baseContractCall, method: "getPoolDetails", args: [] },
  ]);

  return (
    <Box
      mx="auto"
      px={8}
      py={4}
      mt={4}
      rounded="lg"
      shadow="lg"
      bg={useColorModeValue("white", "gray.800")}
      w="6xl"
    >
      <HStack>
        {typeof token0 !== "undefined" ? (
          <>
            <Stat>
              <StatLabel>Token0</StatLabel>
              <StatNumber>
                <TokenName address={token0[0]} />
              </StatNumber>
            </Stat>
          </>
        ) : (
          <Spinner />
        )}

        {typeof token1 !== "undefined" ? (
          <>
            <Stat>
              <StatLabel>Token1</StatLabel>
              <StatNumber>
                <TokenName address={token1[0]} />
              </StatNumber>
            </Stat>
          </>
        ) : (
          <Spinner />
        )}
      </HStack>
      <Divider my={4} />

      <HStack>
        {typeof details === "undefined" ? (
          <Spinner />
        ) : (
          <>
            <Stat>
              <StatLabel>Total Token0 on Pool</StatLabel>
              <StatNumber>{formatUnits(details[0], 18)}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Total Token1 on Pool</StatLabel>
              <StatNumber>{formatUnits(details[1], 18)}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Total Pool Shares</StatLabel>
              <StatNumber>{formatUnits(details[2], 6)}</StatNumber>
            </Stat>
          </>
        )}
      </HStack>

      {typeof account !== "undefined" &&
        account !== null &&
        typeof token0 !== "undefined" &&
        typeof token1 !== "undefined" && (
          <>
            <Divider mt={4} />
            <HStack justifyContent="space-between">
              <MyTokenInfo
                name="Token 0"
                address={token0[0]}
                account={account}
                spender={address}
              />
              <MyTokenInfo
                name="Token 1"
                address={token1[0]}
                account={account}
                spender={address}
              />
            </HStack>
          </>
        )}

      <Divider my={4} />

      <HStack justifyContent="space-between">
        <NextLink href={`/pool/${encodeURIComponent(address)}`} passHref>
          <Button as="a" size="lg">
            Deposit
          </Button>
        </NextLink>

        <NextLink href={`/pool/${encodeURIComponent(address)}`} passHref>
          <Button as="a" size="lg">
            Withdraw
          </Button>
        </NextLink>
      </HStack>
    </Box>
  );
};
