import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  Link,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { shortenAddress, useEthers } from "@usedapp/core";
import NextLink from "next/link";
import { NetworkSelectionOverlay } from "./NetworkSelectionOverlay";

export const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { activateBrowserWallet, account, deactivate } = useEthers();

  return (
    <Box>
      <NetworkSelectionOverlay />
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            textAlign="left"
            fontFamily={"heading"}
            color={useColorModeValue("gray.800", "white")}
          >
            ERC20 Swap
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <Stack direction={"row"} spacing={8}>
              <Box>
                <Link
                  as={NextLink}
                  p={2}
                  href="/"
                  fontSize={"sm"}
                  fontWeight={500}
                >
                  Swap
                </Link>
              </Box>

              <Box>
                <Link
                  as={NextLink}
                  p={2}
                  href="/faucet"
                  fontSize={"sm"}
                  fontWeight={500}
                >
                  Faucet
                </Link>
              </Box>

              <Box>
                <Link
                  as={NextLink}
                  p={2}
                  href="/pool"
                  fontSize={"sm"}
                  fontWeight={500}
                >
                  Pool
                </Link>
              </Box>
            </Stack>
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          {!account && (
            <Button
              display={{ base: "none", md: "inline-flex" }}
              fontSize={"sm"}
              fontWeight={600}
              color={"white"}
              bg={"pink.400"}
              onClick={() => activateBrowserWallet()}
              _hover={{
                bg: "pink.300",
              }}
            >
              Connect Wallet
            </Button>
          )}

          {account && (
            <Button
              display={{ base: "none", md: "inline-flex" }}
              fontSize={"sm"}
              fontWeight={600}
              color={"white"}
              bg={"pink.400"}
              onClick={() => deactivate()}
              _hover={{
                bg: "pink.300",
              }}
            >
              Logout from {shortenAddress(account)}
            </Button>
          )}

          <Button onClick={toggleColorMode}>
            {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};
