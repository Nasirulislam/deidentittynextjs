import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractAddresses, abi } from "../constants"
import { ethers } from "ethers"
import Header from "../components/header";


export default function Home() {
    const contractAddress = '0xE1Ef329e921F4D5b7DCbDc52C01e5324D76C6559';
    const { isWeb3Enabled, chainId, user } = useMoralis();

    const [att1, setAtt1] = useState('')
    const [att2, setAtt2] = useState('')
    const [att3, setAtt3] = useState('')
    const [att4, setAtt4] = useState('')
    const [att5, setAtt5] = useState('')
    const {
        runContractFunction: admin,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "admin",
        params: {},
    })
    async function createIdentityToken() {
        await window.ethereum.enable();
        var adminAddress;
        if (isWeb3Enabled) {
            adminAddress = (await admin())
        }

        console.log(adminAddress)
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        // await window.ethereum.request({ method: 'eth_requestAccounts' });
        const keyB64 = await window.ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [adminAddress],
        }) ;
        const publicKey = Buffer.from(keyB64, 'base64');
        console.log(publicKey)
        console.log(att1, att2, att3, att4, att5)
    }
    return (
        <>
            <Header />
            <div>


                <div>
                    <h1>
                        Create Identity Token
                    </h1>
                    <div className='d-flex justify-content-center flex-column  mt-4'>
                        <label for="id" className=' label-text '>Attribute 1:</label>
                        <input type="text" value={att1} onChange={(e) => setAtt1(e.target.value)} placeholder='Provider Address' />
                    </div>
                    <div className='d-flex justify-content-center flex-column  mt-4'>
                        <label for="id" className=' label-text '>Attribute 2:</label>
                        <input type="text" value={att2} onChange={(e) => setAtt2(e.target.value)} placeholder='Provider Address' />
                    </div>
                    <div className='d-flex justify-content-center flex-column  mt-4'>
                        <label for="id" className=' label-text '>Attribute 3:</label>
                        <input type="text" value={att3} onChange={(e) => setAtt3(e.target.value)} placeholder='Provider Address' />
                    </div>
                    <div className='d-flex justify-content-center flex-column  mt-4'>
                        <label for="id" className=' label-text '>Attribute 4:</label>
                        <input type="text" value={att4} onChange={(e) => setAtt4(e.target.value)} placeholder='Provider Address' />
                    </div>
                    <div className='d-flex justify-content-center flex-column  mt-4'>
                        <label for="id" className=' label-text '>Attribute 5:</label>
                        <input type="text" value={att5} onChange={(e) => setAtt5(e.target.value)} placeholder='Provider Address' />
                    </div>
                    <div className='d-flex justify-content-center mt-3'>
                        <button className='mx-5' onClick={() => createIdentityToken()}>Add Provider</button>
                    </div>
                </div>
                <div>
                    <h1>
                        Create Service Token
                    </h1>
                </div>
            </div>
        </>

    )
}
