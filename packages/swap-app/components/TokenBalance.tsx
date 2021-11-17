import React, { useContext } from "react";
import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Stack,
  Button,
  Link,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
} from "@chakra-ui/react";
import { useContractFunction, useEthers, useTokenBalance } from "@usedapp/core";
import { formatUnits } from "@ethersproject/units";
import { Token, Token__factory } from "types/typechain";
import { DeploymentsContext } from "lib/deployments";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

interface TokenBalanceProps {
  name: string;
  address: string | undefined;
}

const Stats: React.FC<TokenBalanceProps> = ({ address }) => {
  const { account } = useEthers();
  const tokenBalance = useTokenBalance(address, account);

  return (
    <Stat>
      <StatLabel>Available Amount</StatLabel>
      <StatNumber>
        {tokenBalance ? formatUnits(tokenBalance, 18) : <Spinner />}
      </StatNumber>
      <StatHelpText>Current Account</StatHelpText>
    </Stat>
  );
};

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  name,
  address,
}) => {
  const { account, library } = useEthers();

  const contract = Token__factory.connect(address!, library!.getSigner());
  const { send } = useContractFunction(contract, "mint", {
    transactionName: "Mint",
  });

  const mintToken = async () => {
    send(account, BigNumber.from(10).mul(BigNumber.from(10).pow(18)));
  };

  return (
    <Box
      maxW={"320px"}
      w={"full"}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"2xl"}
      rounded={"lg"}
      p={6}
      textAlign={"center"}
    >
      <Heading fontSize={"2xl"} fontFamily={"body"}>
        {name}
      </Heading>
      <Text fontWeight={600} color={"gray.500"} mb={4}>
        Token
      </Text>

      <Stats name={name} address={address} />

      <Stack mt={8} direction={"row"} spacing={4}>
        <Button
          flex={1}
          fontSize={"sm"}
          rounded={"full"}
          bg={"blue.400"}
          color={"white"}
          boxShadow={
            "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
          }
          _hover={{
            bg: "blue.500",
          }}
          _focus={{
            bg: "blue.500",
          }}
          onClick={() => mintToken()}
        >
          Mint 10 {name}
        </Button>
      </Stack>
    </Box>
  );
};
