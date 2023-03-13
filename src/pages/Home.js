import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Footer from '../component/Footer';
import Header from '../component/Header';
import { StoicIdentity } from "ic-stoic-identity";
import Loader from '../component/Loader';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './did.js';

function Home() {

    const [loader, setLoader] = useState(true);
    const [connected, setConnected] = useState(false);
    const [address, setAddress] = useState("");

    const canisterId = 'x7z74-uiaaa-aaaag-qbsnq-cai'; // the ID of your canister

    async function connectWallet() {

        try {
          const identity = await StoicIdentity.load();
          if (identity !== false) {
            // No existing connection, let's make one
           
            setAddress(identity.getPrincipal().toText());
            setConnected(true);
          } else {
            // ID is already connected
            const newIdentity = await StoicIdentity.connect();
            setAddress(newIdentity.getPrincipal().toText());
            setConnected(true);
          }

         const actor = Actor.createActor(idlFactory, {
            agent: new HttpAgent({
                identity,
              }),
              canisterId,
         });


         console.log({actor});

         const nfts = await actor.listings();
         console.log({ nfts });
         


        } catch (error) {
          console.log(`Error connecting to wallet: ${error.message}`);
          setConnected(false);
        }
      }

    const disconnectWallet = () => {
        StoicIdentity.disconnect();
        setConnected(false);
        setAddress("");
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
                {connected &&   <h5 className='font-italic'>Your Princple ID is : {address}</h5> }
                </div>
                <div className='mx-auto text-center mt-5'>
                   {!connected &&  <Button onClick={connectWallet}>Connect Stoic Wallet</Button> }
                   {connected &&  <Button onClick={disconnectWallet} variant= "danger">Disconnect Wallet</Button> }
                </div>

            </Container>
            <Footer />
        </>



    )
}

export default Home