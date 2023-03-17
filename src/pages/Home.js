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
import Modal from 'react-bootstrap/Modal';


function Home() {

    const adminApiKey = process.env.REACT_APP_ADMIN_TOKEN_KEY;
    const canisterId = process.env.REACT_APP_CANISTER_ID;
    const host = 'https://ic0.app';


    const [loader, setLoader] = useState(-1);
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState("");
    const [holdNFT, setHoldNFT] = useState(null);
    const [discountCode, setDiscountCode] = useState("");
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    const getNftsFromCollecton = async (actor) => {
        
        const nfts = await actor.listings();
        const add = "lmpfg-27vgd-wjh2r-6ii7i-serdg-bicui-6efhb-6fv6y-gf7us-znhdc-gae";
        // loop through all nfts and get each nft principle

        let nftHold = false;
        nfts.forEach((nft) => {
            const sellerBytes = nft[1].seller;
            let seller = sellerBytes.toString();
            if (seller === address) {
                nftHold = true;
                // Break out of the loop since we found a match
                return false;
            } 
        });

        if(nftHold) {
            setHoldNFT(true);
            getDiscountCode();
        } else {
            setHoldNFT(false)
        }
        setLoader(false);
    }

    // Connect Wallet with StoicWallet
    const connectStoicWallet = async () => {
        try {
            handleClose();
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
            
            getNftsFromCollecton(actor);


        } catch (error) {
            console.log(`Error connecting to wallet: ${error.message}`);
            setConnected(false);
            setLoader(false);
        }
    }

    const connectPlugWallet = async () => {
        handleClose();
        try {
            const whitelist = [canisterId];
            const identity = await window.ic.plug.requestConnect({
                whitelist,
                host,
            });
            if (identity !== false) {
                setAddress(window.ic.plug.principalId);
                setConnected(true);
            } 

            setLoader(true);
            const actor = await window.ic.plug.createActor({
                canisterId: canisterId,
                interfaceFactory: idlFactory,
            });


            getNftsFromCollecton(actor);

        } catch (error) {
            console.log(`Error connecting to wallet: ${error.message}`);
        }
    }

    // Callback to print sessionData
    const onConnectionUpdate = () => {
        console.log("Here",window.ic.plug.sessionManager.sessionData)
    }

    // Disconnect Wallet
    const disconnectWallet = () => {
        StoicIdentity.disconnect();
        setConnected(false);
        setAddress("");
        setHoldNFT(null);
        setDiscountCode("");
    }

    // Get Discount Shopify Admin API's
    const getDiscountCode = async () => {
        axios.get('/price_rules.json', {
            headers: {
                'X-Shopify-Access-Token': adminApiKey,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        })
            .then((response) => {
                let res = response.data.price_rules;
                res.forEach((code) => {
                    if (code.title.startsWith("NFT")) {
                        setDiscountCode(code.title);
                    }
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }


    useEffect(() => {

        setTimeout(() => {
            setLoader(false);
        }, 1000)

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
                    {!holdNFT && holdNFT !== null && <Alert className='font-italic' variant={"danger"}>You don't hold any NFT from our Collection </Alert>}
                </div>
                <div className="text-center mt-5">
                    {holdNFT && <Alert className='font-italic' variant={"success"}>Your Discounted Code is : {discountCode}</Alert>}
                </div>
                <div className='mx-auto text-center mt-5'>
                    {!connected && <Button onClick={handleShow}>Connect Wallet</Button>}
                    {connected && <Button onClick={disconnectWallet} variant="danger">Disconnect Wallet</Button>}
                </div>

            </Container>
            <Footer />


            <Modal show={show} onHide={handleClose} style={{ marginTop: "30vh" }}>
                <Modal.Header closeButton>
                    <Modal.Title >Choose Wallet</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='d-flex flex-column align-items-center'>
                        <Button size="lg" onClick={connectStoicWallet}>
                            <img src={"assets/stoic.png"} className="img-fluid mr-2" style={{ width: "10%" }} />
                            <span>Stoic Wallet</span>
                        </Button>
                        <Button size="lg" onClick={connectPlugWallet} className="mt-2">
                            <img src={"assets/plug.png"} className="img-fluid mr-2" style={{ width: "10%" }} />
                            <span>Plug Wallet</span>
                        </Button>
                    </div>
                </Modal.Body>

            </Modal>
        </>



    )
}

export default Home