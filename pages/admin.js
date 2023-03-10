import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import { useState, useEffect } from 'react';
import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis";
import Header from "../components/header";
import { ethers } from "ethers";


export default function Admin() {
    const { isWeb3Enabled, chainId, user } = useMoralis();

    const contractAddress = '0x97Ba68e03545Bc4460F43e2810DA352eB29fd501';
    const [allTokens,setAllTokens]=useState([])
    const [encrptedTokenData,setEncryptedTokenData]=useState([])
    const [decrptedTokenData, setDecryptedTokenData] = useState([])
    const [selectedToken,setSelectedToken]=useState('')
    const [signatureHash,setSignatureHash]=useState([])



    const [inputValue, setInputValue] = useState('');
    const { runContractFunction } = useWeb3Contract();
    async function askToGiveAccess() {
        console.log("asking....")
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts', params: ['0x75881b77B600b71C35f7C6E3943F63C56DeE321c'] });
            // Accounts now exposed, use them
            console.log(accounts)
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
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
    async function handleAddSuccessNo(tx) {
        // await tx.wait(1)
        console.log("added")
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            askToGiveAccess()
        }
    }, [isWeb3Enabled])
    async function providePublicKey() {
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        // await window.ethereum.request({ method: 'eth_requestAccounts' });
        const keyB64 = await window.ethereum.request({
            method: 'eth_getEncryptionPublicKey',
            params: [account],
        });
        console.log(keyB64)
        const publicKey = Buffer.from(keyB64, 'base64');
        console.log(publicKey)
        console.log(publicKey)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "storePublicKey",
            params: {
                _publicKey: publicKey,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
    }
    async function decrypt() {
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        var enc = {
            ciphertext
                :
                "7nhapOmWTV/FSoZ0j/2BSHTQm9fo3Xjn+3o=",
            ephemPublicKey
                :
                "2A7v7ohg2azu0YOVIVVoU97MXi8O2auI8D+8Pc721gw=",
            nonce
                :
                "bpSfXCgsfqnoar5dxdnTlak2kWtfkk2h",
            version
                :
                "x25519-xsalsa20-poly1305"
        }
        const buf = Buffer.concat([
            Buffer.from(enc.ephemPublicKey, 'base64'),
            Buffer.from(enc.nonce, 'base64'),
            Buffer.from(enc.ciphertext, 'base64'),
        ]);
        decryptData(account, buf)
    }
    async function decryptData(account, data) {
        // console.log(structuredData)
        // Reconstructing the original object outputed by encryption
        const structuredData = {
            version: 'x25519-xsalsa20-poly1305',
            ephemPublicKey: data.slice(0, 32).toString('base64'),
            nonce: data.slice(32, 56).toString('base64'),
            ciphertext: data.slice(56).toString('base64'),
        };
        // Convert data to hex string required by MetaMask
        const ct = `0x${Buffer.from(JSON.stringify(structuredData), 'utf8').toString('hex')}`;
        // Send request to MetaMask to decrypt the ciphertext
        // Once again application must have acces to the account
        const decrypt = await window.ethereum.request({
            method: 'eth_decrypt',
            params: [ct, account],
        });
        console.log(decrypt)
        return decrypt
        // Decode the base85 to final bytes
        // return ascii85.decode(decrypt);
    }
    async function getTokens(){
        
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getUnsignedRejectedIdentityTokens",
            params: {},
        }

       var tokens= await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        // const SecondListOptions = {
        //     abi: abi,
        //     contractAddress: contractAddress,
        //     functionName: "getIdentityToken",
        //     params: {
        //         _user:tokens[0]
        //     },
        // }

        // const tokenData = await runContractFunction({
        //     params: SecondListOptions,
        //     onSuccess: handleAddSuccessNo,
        //     onError: (error) => console.log(error),
        // })
        console.log(tokens)
        var index = tokens.indexOf('0x0000000000000000000000000000000000000000')
        console.log(index)
        // tokens.splice(index)
        var setToToken=[]
        for(var i=0;i<index;i++){
            setToToken.push(tokens[i])
        }
        setAllTokens(setToToken)
        console.log(tokens)
        // console.log(tokenData.attribute4)
        // // var data5 = Buffer.from(tokenData.attribute5.toString(), 'base64');
        // const data5 = Buffer.from(tokenData.attribute5.slice(2), 'hex');
        // console.log(data5)
        // const structuredData = {
        //     version: 'x25519-xsalsa20-poly1305',
        //     ephemPublicKey: data5.slice(0, 32).toString('base64'),
        //     nonce: data5.slice(32, 56).toString('base64'),
        //     ciphertext: data5.slice(56).toString('base64'),
        // };
        // console.log(structuredData)
        // decryptData(account, structuredData)
    }
    async function getTokenData(token){
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        const SecondListOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getIdentityToken",
            params: {
                _user:token
            },
        }
        setSelectedToken(token)
        const tokenData = await runContractFunction({
            params: SecondListOptions,
            onSuccess: handleAddSuccessNo,
            onError: (error) => console.log(error),
        })
        console.log(tokenData)
        var encryptedDataToBe=[]
        
        const att1 = Buffer.from(tokenData.attribute1.slice(2), 'hex');
        const att2 = Buffer.from(tokenData.attribute2.slice(2), 'hex');
        const att3 = Buffer.from(tokenData.attribute3.slice(2), 'hex');
        const att4 = Buffer.from(tokenData.attribute4.slice(2), 'hex');
        const att5 = Buffer.from(tokenData.attribute5.slice(2), 'hex');
        encryptedDataToBe.push(att1.slice(56).toString('base64'))
        encryptedDataToBe.push(att2.slice(56).toString('base64'))
        encryptedDataToBe.push(att3.slice(56).toString('base64'))
        encryptedDataToBe.push(att4.slice(56).toString('base64'))
        encryptedDataToBe.push(att5.slice(56).toString('base64'))
        setEncryptedTokenData(encryptedDataToBe)
        var att1Val = await decryptData(account, att1)
        var att2Val = await decryptData(account, att2)
        var att3Val = await decryptData(account, att3)
        var att4Val = await decryptData(account, att4)
        var att5Val = await decryptData(account, att5)
        console.log(att1Val, att2Val, att3Val, att4Val, att5Val)
        var decryptedDataToBe=[]
        decryptedDataToBe.push(att1Val)
        decryptedDataToBe.push(att2Val)
        decryptedDataToBe.push(att3Val)
        decryptedDataToBe.push(att4Val)
        decryptedDataToBe.push(att5Val)
        setDecryptedTokenData(decryptedDataToBe)


        // const structuredData = {
        //     version: 'x25519-xsalsa20-poly1305',
        //     ephemPublicKey: data5.slice(0, 32).toString('base64'),
        //     nonce: data5.slice(32, 56).toString('base64'),
        //     ciphertext: data5.slice(56).toString('base64'),
        // };
        // console.log(structuredData)
        // decryptData(account, structuredData)
    }
    async function sign(){
        var account;
        try {
            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Accounts now exposed, use them
            console.log(accounts)
            account = accounts[0]
            // ethereum.send('eth_sendTransaction', { from: accounts[0], /* ... */ })
        } catch (error) {
            console.log(error)
            // User denied account access
        }
        var signingHash1;
        var signedHahArr=[]
        if(isWeb3Enabled){
            try{
                const attr1SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[0], account] })
                const attr2SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[1], account] })
                const attr3SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[2], account] })
                const attr4SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[3], account] })
                const attr5SigninatureHash = await window.ethereum.request({ method: 'personal_sign', params: [decrptedTokenData[4], account] })
                signedHahArr.push(attr1SigninatureHash)
                signedHahArr.push(attr2SigninatureHash)
                signedHahArr.push(attr3SigninatureHash)
                signedHahArr.push(attr4SigninatureHash)
                signedHahArr.push(attr5SigninatureHash)
                setSignatureHash(signedHahArr)
            }catch(error){
                console.log('error')
            }
                
            }
            
        else{
            console.log('not enabled')
        }
    }
    async function saveSignature(){
        console.log(signatureHash)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "signIdentityToken",
            params: {
                user:selectedToken,
                attribute1Hash: signatureHash[0],
                attribute2Hash: signatureHash[1],
                attribute3Hash: signatureHash[2],
                attribute4Hash: signatureHash[3],
                attribute5Hash: signatureHash[4],
            },
        }

         await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
    }
    return (

        <div>
            <Header />
            <h1>
                Admin
            </h1>
            <button className='mx-5' onClick={() => providePublicKey()}>Provide Public Key</button>
            <div>

            <button className='mx-5' onClick={() => getTokens()}>Get Tokens</button>
            </div>
            {allTokens.map((token)=>(
                <div onClick={()=>getTokenData(token)}>
                    <h4>
                        {token}
                    </h4>
                </div>
            ))}
            <div>
                <h2>
                    Encrypted Token Data
                </h2>
                <h6>
                    {encrptedTokenData[0] && encrptedTokenData[0]}
                </h6>
                <h6>
                    {encrptedTokenData[1] && encrptedTokenData[1]}
                </h6>
                <h6>
                    {encrptedTokenData[2] && encrptedTokenData[2]}
                </h6>
                <h6>
                    {encrptedTokenData[3] && encrptedTokenData[3]}
                </h6>
                <h6>
                    {encrptedTokenData[4] && encrptedTokenData[4]}
                </h6>
            </div>
            <div>
                <h2>
                    Decrypted Token Data
                </h2>
                <h6>
                    {decrptedTokenData[0] && decrptedTokenData[0]}
                </h6>
                <h6>
                    {decrptedTokenData[1] && decrptedTokenData[1]}
                </h6>
                <h6>
                    {decrptedTokenData[2] && decrptedTokenData[2]}
                </h6>
                <h6>
                    {decrptedTokenData[3] && decrptedTokenData[3]}
                </h6>
                <h6>
                    {decrptedTokenData[4] && decrptedTokenData[4]}
                </h6>
            </div>
            <button className='mx-5' onClick={() => sign()}>Verify & Sign</button>
            <div>
                <h2>Signature hash</h2>
                {signatureHash.map((hash)=>(
                    <h6>
                        {hash}
                    </h6>
                ))}
            </div>
            <button className='mx-5' onClick={() => saveSignature()}>Save Signatures</button>
            {/* <button className='mx-5' onClick={() => getTokens()}>Reject</button> */}

            <div className='d-flex justify-content-center flex-column  mt-4'>
                <label for="id" className=' label-text '>Address:</label>
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Provider Address' />
            </div>
            <div className='d-flex justify-content-center mt-3'>
                <button className='mx-5' onClick={() => addProvider()}>Add Provider</button>
            </div>
        </div>

    )
}
