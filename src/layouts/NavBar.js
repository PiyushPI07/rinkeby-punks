import React, { useEffect } from "react";
import {
  chakra, Box, Flex, useColorModeValue, VisuallyHidden, HStack, Button, useDisclosure,
  VStack, IconButton, CloseButton,
} from "@chakra-ui/react";
import { AiOutlineMenu } from "react-icons/ai";
import { Link } from '@chakra-ui/react'
import { Link as RouterLink } from "react-router-dom"
import LoginButton from "../components/LoginButton";
import abi from "../abi/abi.json"
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc} from "firebase/firestore";

export default function NavBar() {

    const bg = useColorModeValue("white", "gray.800");
    const mobileNav = useDisclosure();
    const contractAddr = "0xfb6B832Ff91664620E699B0dc615996A6E80Ec0C";

    const { user, setOwnedPunks, setMintedPunks, setListedPunks, setPunkPrice } = useAuth();
    useEffect(() => {
        let isConnected = true;
        const getWalletOfOwner = async() => {
          try {
            const docRef1 = doc(db, "punks", "minted");
            const docSnap1 = await getDoc(docRef1);
            setMintedPunks(Object.keys(docSnap1.data()))
            let _listedPunks = []
            let _punkPrice = {}
            for( const i in docSnap1.data()) {
                if('listed' in docSnap1.data()[i] &&  docSnap1.data()[i]['listed']===true) {
                    _listedPunks.push(i)
                    _punkPrice[i]=docSnap1.data()[i]['price']
                }
            }
            setListedPunks(_listedPunks);
            setPunkPrice(_punkPrice);
            const { ethereum } = window; //injected by metamask
            //connect to an ethereum node
            const provider = new ethers.providers.Web3Provider(ethereum); 
            //gets the account
            const signer = provider.getSigner(); 
            //connects with the contract
            const connectedContract = new ethers.Contract(contractAddr, abi.output.abi, signer);
            if(user) {
              let _ownedPunks = await connectedContract.walletOfOwner(user.wallet_address);
              setOwnedPunks(_ownedPunks.map(x => parseInt(x["_hex"])))
            }
          } catch(err) {
            console.log(err)
          }
          
        }
        if(isConnected) {
          getWalletOfOwner();
        }
      
        return () => {
          isConnected = false;
        };
      }, [setOwnedPunks, user, setMintedPunks, setListedPunks, setPunkPrice]);

    return (
        <>
        <chakra.header
            bg={bg} w="full" px={{ base: 2, sm: 4 }} py={4} shadow="md" mb={2}
            style={{
                position: "sticky",
                top: "0",
                opacity: "1",
                zIndex: "99"}}
        >
            <Flex alignItems="center" justifyContent="space-between" mx="auto">
            <Flex>
                <chakra.a
                href="/"
                title="Choc Home Page"
                display="flex"
                alignItems="center"
                >
                
                <VisuallyHidden>Choc</VisuallyHidden>
                </chakra.a>
                <Link as={RouterLink} to="/" style={{textDecoration: 'none'}}>
                    <Button variant="ghost" style={{ backgroundColor: 'transparent' }}>
                        <chakra.h1 fontSize="xl" fontWeight="medium" ml="2">
                            Rinkeby Punks
                        </chakra.h1>
                    </Button>
                </Link>
                
            </Flex>
            <HStack display="flex" alignItems="center" spacing={1}>
                <HStack
                spacing={1}
                mr={1}
                color="brand.500"
                display={{ base: "none", md: "inline-flex" }}
                >
                    <Link as={RouterLink} to="/marketplace" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">MarketPlace</Button>
                    </Link>
                    <Link as={RouterLink} to="/gallery" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">Gallery</Button>
                    </Link>
                    <Link as={RouterLink} to="/account" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">Account</Button>
                    </Link>
                </HStack>
                <LoginButton screen="lg"/>
                <Box display={{ base: "inline-flex", md: "none" }}>
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    aria-label="Open menu"
                    fontSize="20px"
                    color={useColorModeValue("gray.800", "inherit")}
                    variant="ghost"
                    icon={<AiOutlineMenu />}
                    onClick={mobileNav.onOpen}
                />

                <VStack
                    pos="absolute"
                    top={0}
                    left={0}
                    right={0}
                    display={mobileNav.isOpen ? "flex" : "none"}
                    flexDirection="column"
                    p={2}
                    pb={4}
                    m={2}
                    bg={bg}
                    spacing={3}
                    rounded="sm"
                    shadow="sm"
                >
                    <CloseButton
                    aria-label="Close menu"
                    onClick={mobileNav.onClose}
                    />

                    <Link as={RouterLink} to="/marketplace" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">MarketPlace</Button>
                    </Link>
                    <Link as={RouterLink} to="/gallery" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">Gallery</Button>
                    </Link>
                    <Link as={RouterLink} to="/account" style={{textDecoration: 'none'}}>
                        <Button variant="ghost">Account</Button>
                    </Link>
                    <LoginButton screen="sm"/>
                </VStack>
                </Box>
            </HStack>
            </Flex>
        </chakra.header>
        </>
    );
}