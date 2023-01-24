import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import { useState,useEffect } from 'react';
import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../components/header";
import { ethers } from "ethers";


export default function Admin() {
    const { isWeb3Enabled, chainId, user } = useMoralis();

    const contractAddress = '0xE1Ef329e921F4D5b7DCbDc52C01e5324D76C6559';
    
        
    
    
    const [inputValue, setInputValue] = useState('');
    const { runContractFunction } = useWeb3Contract();
    async function askToGiveAccess(){
        console.log("asking....")
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            // Accounts now exposed, use them
            console.log(accounts)
            ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
    //    await window.ethereum.request({ method: 'eth_requestAccounts' })
    }
    async function addProvider() {
        if (!ethers.utils.isAddress(inputValue)) {
            console.log("Invalid address")
            return
        }
        
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "addServiceProvider",
            params: {
                serviceProvider: inputValue,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })

    }
    async function handleAddSuccess(tx) {
        await tx.wait(1)
        console.log("added")
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            askToGiveAccess()
        }
    }, [isWeb3Enabled])
    return (

        <div>
            <Header />
            <h1>
                Admin
            </h1>
            <div className='d-flex justify-content-center flex-column  mt-4'>
                <label for="id" className=' label-text '>Address:</label>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Provider Address' />
            </div>
            <div className='d-flex justify-content-center mt-3'>
                <button className='mx-5' onClick={()=>addProvider()}>Add Provider</button>
            </div>
        </div>

    )
}
