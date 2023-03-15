import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Footer from '../component/Footer';
import Header from '../component/Header';
import { StoicIdentity } from "ic-stoic-identity";
import Loader from '../component/Loader';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './did.js';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';

function Home() {


    const adminApiKey= process.env.REACT_APP_ADMIN_TOKEN_KEY;
    const apiKey = process.env.REACT_APP_API_KEY;
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const shopName  = process.env.REACT_APP_SHOP_NAME;
    const canisterId = process.env.REACT_APP_CANISTER_ID; 
    const host = 'https://ic0.app';


    const [loader, setLoader] = useState(true);
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState("");
    const [holdNFT, setHoldNFT] = useState(-1);


    // Connect Wallet with StoicWallet
    async function connectWallet() {

        try {
            const identity = await StoicIdentity.load();
            if (identity !== false) {
                setAddress(identity.getPrincipal().toText());
                setConnected(true);
            } else {
                const newIdentity = await StoicIdentity.connect();
                setAddress(newIdentity.getPrincipal().toText());
                setConnected(true);
            }

            setLoader(true);
            const actor = Actor.createActor(idlFactory, {
                agent: new HttpAgent({ identity, host: host }),
                canisterId,
            });

            const nfts = await actor.listings();


            // loop through all nfts and get each nft principle

            nfts.forEach((nft) => {
                const sellerBytes = nft[1].seller;
                let seller = sellerBytes.toString();

                if (seller != address) {
                    setHoldNFT(false);
                    setLoader(false);
                } else {
                    setHoldNFT(true);
                    setLoader(false);
                }
            });


        } catch (error) {
            console.log(`Error connecting to wallet: ${error.message}`);
            setConnected(false);
            setLoader(false);
        }
    }

    // Disconnect Wallet
    const disconnectWallet = () => {
        StoicIdentity.disconnect();
        setConnected(false);
        setAddress("");
        setHoldNFT(-1);
    }

    // Get Discount Shopify Admin API's
    const geTDiscountCode = async () => {
        axios.get(`https://${shopName}.myshopify.com/admin/api/2022-01/price_rules.json`, {
            headers: {
              'X-Shopify-Access-Token': adminApiKey,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*'
            },
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
      }


    useEffect(() => {

        setTimeout(() => {
            setLoader(false);
        }, 1000)
        geTDiscountCode();
    }, [])

    return (
        <>

            {loader && <Loader />}
            <Header />
            <Container fluid="md">
                <div className='mt-5'>
                    <h2 className='text-center'>Connect Your Wallet, Verify Your NFT and Get 100% Discounted Coupon</h2>
                </div>

                <div className="text-center mt-5">
                    {connected && <h5 className='font-italic'>Your Principle ID is : {address}</h5>}
                </div>

                <div className="text-center mt-5">
                    {!holdNFT && <Alert className='font-italic' variant={"danger"}>You don't hold any NFT from our Collection</Alert>}
                </div>
                <div className='mx-auto text-center mt-5'>
                    {!connected && <Button onClick={connectWallet}>Connect Stoic Wallet</Button>}
                    {connected && <Button onClick={disconnectWallet} variant="danger">Disconnect Wallet</Button>}
                </div>

            </Container>
            <Footer />
        </>



    )
}

export default Home