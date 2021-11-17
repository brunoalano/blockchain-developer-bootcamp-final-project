import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuIcon,
  MenuCommand,
  MenuDivider,
} from "@chakra-ui/react";
import { ChainId, getChainName, useEthers } from "@usedapp/core";
import { DeploymentsContext } from "lib/deployments";
import React, { useContext, useState } from "react";

export const NetworkSelectionOverlay = () => {
  const { chainId } = useEthers();
  const deploymentsContext = useContext(DeploymentsContext);
  const { isOpen, onOpen, onClose } = useDisclosure({
    isOpen:
      typeof chainId !== "undefined" && deploymentsContext.current === null,
  });

  const [isChangingNetwork, setIsChangingNetwork] = useState<boolean>(false);

  const changeNetwork = async (chainId: ChainId) => {
    if (typeof window === "undefined" || typeof window.ethereum === "undefined")
      return;
    setIsChangingNetwork(true);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }],
      });
    } catch (switchError) {
      console.log("erro ao trocar");
    } finally {
      setIsChangingNetwork(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Wrong Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p>Actually we dont support this network.</p>
        </ModalBody>

        <ModalFooter>
          <Menu>
            <MenuButton
              colorScheme="blue"
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >
              Select Network
            </MenuButton>
            <MenuList>
              {Object.keys(deploymentsContext)
                .filter((c) => c !== "current")
                .map((networkId) => (
                  <MenuItem
                    key={networkId}
                    onClick={() =>
                      changeNetwork(parseInt(networkId) as ChainId)
                    }
                  >
                    {getChainName(parseInt(networkId) as ChainId)}
                  </MenuItem>
                ))}
            </MenuList>
          </Menu>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
