import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useMoralis, useWeb3Contract } from "react-moralis";
import { contractAddresses, abi } from "../constants"
import { ethers } from "ethers"
import Header from "../components/header";
import { encrypt } from '@metamask/eth-sig-util';
const ascii85 = require('ascii85');


export default function Home() {
    // const contractAddress = '0xDdb87D4Bf5A626869964783f9010a81842145555';
    const contractAddress = '0x97Ba68e03545Bc4460F43e2810DA352eB29fd501';


    const { isWeb3Enabled, chainId, user } = useMoralis();
    const { runContractFunction } = useWeb3Contract();
    //Identity Attributes
    const [att1, setAtt1] = useState('')
    const [att2, setAtt2] = useState('')
    const [att3, setAtt3] = useState('')
    const [att4, setAtt4] = useState('')
    const [att5, setAtt5] = useState('')

    //Identity Attributes reference for service token
    // const [att1Ref, setAtt1Ref] = useState('')
    // const [att2Ref, setAtt2Ref] = useState('')
    // const [att3Ref, setAtt3Ref] = useState('')
    // const [att4Ref, setAtt4Ref] = useState('')
    // const [att5Ref, setAtt5Ref] = useState('')
    const [attReference,setArrRef]=useState(['','','','',''])

    //service providers
    const [serviceProviders,setServiceProviders]=useState([])

    //variable to hold selected provider address
    const [selectedOption, setSelectedOption] = useState('');

    //service attributes
    const [serviceAtt1, setServiceAtt1] = useState('')
    const [serviceAtt2, setServiceAtt2] = useState('')
    const [serviceAtt3, setServiceAtt3] = useState('')
    const [serviceAtt4, setServiceAtt4] = useState('')
    const [serviceAtt5, setServiceAtt5] = useState('')
    const [myTokenInfo, setMyTokenInfo] = useState(2)
    const options = ['Attribute 1', 'Attribute 2', 'Attribute 3', 'Attribute 4', 'Attribute 5']
    const [selectedOptions, setSelectedOptions] = useState([])
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
    async function createIdentityToken(buf1, buf2, buf3, buf4, buf5) {
        await window.ethereum.enable();
        var adminAddress;
        if (isWeb3Enabled) {
            adminAddress = (await admin())
        }

        console.log(adminAddress)
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
        // const keyB64 = await window.ethereum.request({
        //     method: 'eth_getEncryptionPublicKey',
        //     params: [account],
        // }) ;
        // const publicKey = Buffer.from(keyB64, 'base64');
        // console.log(publicKey)
        // const enc = encrypt({
        //     publicKey: publicKey.toString('base64'),
        //     data: "Moiz Ahmad",
        //     version: 'x25519-xsalsa20-poly1305',
        // });
        // console.log(enc)
        // // We want to store the data in smart contract, therefore we concatenate them
        // // into single Buffer
        // const buf = Buffer.concat([
        //     Buffer.from(enc.ephemPublicKey, 'base64'),
        //     Buffer.from(enc.nonce, 'base64'),
        //     Buffer.from(enc.ciphertext, 'base64'),
        // ]);
        // console.log(buf)
        // console.log(att1, att2, att3, att4, att5)
        // const resp = await decryptData(account,buf)
        // console.log(resp)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "createIdentityToken",
            params: {
                attribute1: buf1,
                attribute2: buf2,
                attribute3: buf3,
                attribute4: buf4,
                attribute5: buf5
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessTransactions,
            onError: (error) => console.log(error),
        })
    }
    async function decryptData(account, data) {
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
        // Decode the base85 to final bytes
        return ascii85.decode(decrypt);
    }

    async function encryptData() {
        await window.ethereum.enable();
        var adminAddress;
        if (isWeb3Enabled) {
            adminAddress = (await admin())
        }

        console.log(adminAddress)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getPublicKey",
            params: {
                _address: adminAddress,
            },
        }

        const adminKey = await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
        console.log(adminKey)
        // const publicKey = Buffer.from(adminKey, 'base64');
        // var publicKey = Buffer.from(adminKey.toString(), 'base64');
        const publicKey = Buffer.from(adminKey.slice(2), 'hex');
        // publicKey=publicKey.slice(0,32)
        console.log(publicKey)
        const enc = encrypt({
            publicKey: publicKey.toString('base64'),
            data: att1,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf = Buffer.concat([
            Buffer.from(enc.ephemPublicKey, 'base64'),
            Buffer.from(enc.nonce, 'base64'),
            Buffer.from(enc.ciphertext, 'base64'),
        ]);
        console.log(enc)
        console.log(buf)

        //second attribute
        const enc2 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: att2,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf2 = Buffer.concat([
            Buffer.from(enc2.ephemPublicKey, 'base64'),
            Buffer.from(enc2.nonce, 'base64'),
            Buffer.from(enc2.ciphertext, 'base64'),
        ]);
        //third arrtibute
        const enc3 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: att3,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf3 = Buffer.concat([
            Buffer.from(enc3.ephemPublicKey, 'base64'),
            Buffer.from(enc3.nonce, 'base64'),
            Buffer.from(enc3.ciphertext, 'base64'),
        ]);
        //forth attribute
        const enc4 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: att4,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf4 = Buffer.concat([
            Buffer.from(enc4.ephemPublicKey, 'base64'),
            Buffer.from(enc4.nonce, 'base64'),
            Buffer.from(enc4.ciphertext, 'base64'),
        ]);
        //fifth attribue
        const enc5 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: att5,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf5 = Buffer.concat([
            Buffer.from(enc5.ephemPublicKey, 'base64'),
            Buffer.from(enc5.nonce, 'base64'),
            Buffer.from(enc5.ciphertext, 'base64'),
        ]);
        createIdentityToken(buf, buf2, buf3, buf4, buf5)

    }
    async function handleAddSuccess(tx) {
        // await tx.wait(1)
        console.log("added")
    }
    async function handleAddSuccessTransactions(tx) {
        await tx.wait(1)
        console.log("added")
    }
    async function getMyTokenFunc() {
        if (isWeb3Enabled) {
            const listOptions = {
                abi: abi,
                contractAddress: contractAddress,
                functionName: "getMyToken",
                params: {},
            }

            const myTokenInfo = await runContractFunction({
                params: listOptions,
                onSuccess: handleAddSuccess,
                onError: (error) => console.log(error),
            })
            console.log(myTokenInfo._hex[myTokenInfo._hex.length - 1])
            setMyTokenInfo(Number(myTokenInfo._hex[myTokenInfo._hex.length - 1]))
            if (Number(myTokenInfo._hex[myTokenInfo._hex.length - 1])==0){
                const listOptions2 = {
                    abi: abi,
                    contractAddress: contractAddress,
                    functionName: "getServiceProviders",
                    params: {},
                }

                const serviceProvidersAddress = await runContractFunction({
                    params: listOptions2,
                    onSuccess: handleAddSuccess,
                    onError: (error) => console.log(error),
                })
                console.log(serviceProvidersAddress)
                setServiceProviders(serviceProvidersAddress)
            }
        }
    }
    useEffect(() => {
        getMyTokenFunc()
    }, [isWeb3Enabled])
    function handleChange(event) {
        const { value, checked } = event.target
        if (checked) {
            setSelectedOptions([...selectedOptions, value])
        } else {
            setSelectedOptions(selectedOptions.filter(o => o !== value))
        }
    }
    function handleRefInput(event,index){
        console.log(event.target.value)
        attReference[index]=event.target.value
        console.log(index)
    }
    // async function encryptServiceData(){
    //     console.log(selectedOptions)
    //     console.log(attReference)
    //     console.log(serviceProviders)
    //     console.log(selectedOption)
    // }
    async function encryptServiceData() {
        await window.ethereum.enable();
        var adminAddress;
        

        console.log(adminAddress)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "getPublicKey",
            params: {
                _address: selectedOption,
            },
        }

        const serviceProviders = await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccess,
            onError: (error) => console.log(error),
        })
        console.log(serviceProviders)
        // const publicKey = Buffer.from(adminKey, 'base64');
        // var publicKey = Buffer.from(adminKey.toString(), 'base64');
        const publicKey = Buffer.from(serviceProviders.slice(2), 'hex');
        // publicKey=publicKey.slice(0,32)
        console.log(publicKey)
        const enc = encrypt({
            publicKey: publicKey.toString('base64'),
            data: serviceAtt1,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf = Buffer.concat([
            Buffer.from(enc.ephemPublicKey, 'base64'),
            Buffer.from(enc.nonce, 'base64'),
            Buffer.from(enc.ciphertext, 'base64'),
        ]);
        console.log(enc)
        console.log(buf)

        //second attribute
        const enc2 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: serviceAtt2,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf2 = Buffer.concat([
            Buffer.from(enc2.ephemPublicKey, 'base64'),
            Buffer.from(enc2.nonce, 'base64'),
            Buffer.from(enc2.ciphertext, 'base64'),
        ]);
        //third arrtibute
        const enc3 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: serviceAtt3,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf3 = Buffer.concat([
            Buffer.from(enc3.ephemPublicKey, 'base64'),
            Buffer.from(enc3.nonce, 'base64'),
            Buffer.from(enc3.ciphertext, 'base64'),
        ]);
        //forth attribute
        const enc4 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: serviceAtt4,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf4 = Buffer.concat([
            Buffer.from(enc4.ephemPublicKey, 'base64'),
            Buffer.from(enc4.nonce, 'base64'),
            Buffer.from(enc4.ciphertext, 'base64'),
        ]);
        //fifth attribue
        const enc5 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: serviceAtt5,
            version: 'x25519-xsalsa20-poly1305',
        });
        const buf5 = Buffer.concat([
            Buffer.from(enc5.ephemPublicKey, 'base64'),
            Buffer.from(enc5.nonce, 'base64'),
            Buffer.from(enc5.ciphertext, 'base64'),
        ]);
        if (!selectedOptions.includes('Attribute 1')) {
            attReference[0] = "No Value"
        }
        if (!selectedOptions.includes('Attribute 2')) {
            attReference[1] = "No Value"
        }
        if (!selectedOptions.includes('Attribute 3')) {
            attReference[2] = "No Value"
        }
        if (!selectedOptions.includes('Attribute 4')) {
            attReference[3] = "No Value"
        }
        if (!selectedOptions.includes('Attribute 5')) {
            attReference[4] = "No Value"
        }
        var serviceEnc1 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: attReference[0],
            version: 'x25519-xsalsa20-poly1305',
        });
        var serviceBuf1 = Buffer.concat([
            Buffer.from(serviceEnc1.ephemPublicKey, 'base64'),
            Buffer.from(serviceEnc1.nonce, 'base64'),
            Buffer.from(serviceEnc1.ciphertext, 'base64'),
        ]);
        var serviceEnc2 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: attReference[1],
            version: 'x25519-xsalsa20-poly1305',
        });
        var serviceBuf2 = Buffer.concat([
            Buffer.from(serviceEnc2.ephemPublicKey, 'base64'),
            Buffer.from(serviceEnc2.nonce, 'base64'),
            Buffer.from(serviceEnc2.ciphertext, 'base64'),
        ]);
        var serviceEnc3 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: attReference[2],
            version: 'x25519-xsalsa20-poly1305',
        });
        var serviceBuf3 = Buffer.concat([
            Buffer.from(serviceEnc3.ephemPublicKey, 'base64'),
            Buffer.from(serviceEnc3.nonce, 'base64'),
            Buffer.from(serviceEnc3.ciphertext, 'base64'),
        ]);
        var serviceEnc4 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: attReference[3],
            version: 'x25519-xsalsa20-poly1305',
        });
        var serviceBuf4 = Buffer.concat([
            Buffer.from(serviceEnc4.ephemPublicKey, 'base64'),
            Buffer.from(serviceEnc4.nonce, 'base64'),
            Buffer.from(serviceEnc4.ciphertext, 'base64'),
        ]);
        var serviceEnc5 = encrypt({
            publicKey: publicKey.toString('base64'),
            data: attReference[4],
            version: 'x25519-xsalsa20-poly1305',
        });
        var serviceBuf5 = Buffer.concat([
            Buffer.from(serviceEnc5.ephemPublicKey, 'base64'),
            Buffer.from(serviceEnc5.nonce, 'base64'),
            Buffer.from(serviceEnc5.ciphertext, 'base64'),
        ]);

        // if(!selectedOptions.includes('Attribute 1')){
        //     serviceBuf1 ="No Value"
        // }
        // if (!selectedOptions.includes('Attribute 2')) {
        //     serviceBuf2 = "No Value"
        // }
        // if(!selectedOptions.includes('Attribute 3')){
        //     serviceBuf3 ="No Value"
        // }
        // if (!selectedOptions.includes('Attribute 4')) {
        //     serviceBuf4 = "No Value"
        // }
        // if (!selectedOptions.includes('Attribute 5')) {
        //     serviceBuf5 = "No Value"
        // }
        createServiceToken(buf,buf2,buf3,buf4,buf5,serviceBuf1, serviceBuf2, serviceBuf3, serviceBuf4, serviceBuf5)

    }
    async function createServiceToken(buf1, buf2, buf3, buf4, buf5, serviceBuf1, serviceBuf2, serviceBuf3, serviceBuf4, serviceBuf5){
        var serAttArr=[]
        var idenRefArr=[]
        serAttArr.push(buf1)
        serAttArr.push(buf2)
        serAttArr.push(buf3)
        serAttArr.push(buf4)
        serAttArr.push(buf5)
        idenRefArr.push(serviceBuf1)
        idenRefArr.push(serviceBuf2)
        idenRefArr.push(serviceBuf3)
        idenRefArr.push(serviceBuf4)
        idenRefArr.push(serviceBuf5)
        console.log(serAttArr)
        console.log(idenRefArr)
        const serAttArrBuffer = Buffer.from(serAttArr,'hex');
        const identidyRefArrayBuffer = Buffer.from(idenRefArr,'hex');
        console.log(serAttArrBuffer)
        console.log(idenRefArr)
        console.log(selectedOption)
        const listOptions = {
            abi: abi,
            contractAddress: contractAddress,
            functionName: "addServiceToken",
            params: {
                serviceProvider: selectedOption,
                serviceAttribute1: buf1,
                serviceAttribute2: buf2,
                serviceAttribute3: buf3,
                serviceAttribute4: buf4,
                serviceAttribute5: buf5,
                identityAttributeReference1: serviceBuf1,
                identityAttributeReference2: serviceBuf2,
                identityAttributeReference3: serviceBuf3,
                identityAttributeReference4: serviceBuf4,
                identityAttributeReference5: serviceBuf5
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: handleAddSuccessTransactions,
            onError: (error) => console.log(error),
        })
    }
    return (
        <>
            <Header />
            <div>

                {myTokenInfo == 2 ?
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
                            <button className='mx-5' onClick={() => encryptData()}>Encrypt</button>
                        </div>
                    </div>
                    : myTokenInfo == 1 ?
                        <h1>Token is rejected</h1> :
                        <h1>Token is signed you can create a service token now!</h1>
                }
                {myTokenInfo == 0 ?
                    <div>
                        <h1>
                            Create Service Token
                        </h1>
                        <h4>
                            Please choose Service provider
                        </h4>
                        <select 
                        defaultValue={'Select'}
                            onChange={e => setSelectedOption(e.target.value)}>
                            <option value="" selected disabled hidden>Choose here</option>
                        {serviceProviders.map((provider)=> (
                            <option key={provider} value={provider}>
                                    {provider}
                                </option>
                            )
                            
)}
                        </select >
                        <div className='d-flex justify-content-center flex-column  mt-4'>
                            <label for="id" className=' label-text '>Attribute 1:</label>
                            <input type="text" value={serviceAtt1} onChange={(e) => setServiceAtt1(e.target.value)} placeholder='Provider Address' />
                        </div>
                        <div className='d-flex justify-content-center flex-column  mt-4'>
                            <label for="id" className=' label-text '>Attribute 2:</label>
                            <input type="text" value={serviceAtt2} onChange={(e) => setServiceAtt2(e.target.value)} placeholder='Provider Address' />
                        </div>
                        <div className='d-flex justify-content-center flex-column  mt-4'>
                            <label for="id" className=' label-text '>Attribute 3:</label>
                            <input type="text" value={serviceAtt3} onChange={(e) => setServiceAtt3(e.target.value)} placeholder='Provider Address' />
                        </div>
                        <div className='d-flex justify-content-center flex-column  mt-4'>
                            <label for="id" className=' label-text '>Attribute 4:</label>
                            <input type="text" value={serviceAtt4} onChange={(e) => setServiceAtt4(e.target.value)} placeholder='Provider Address' />
                        </div>
                        <div className='d-flex justify-content-center flex-column  mt-4'>
                            <label for="id" className=' label-text '>Attribute 5:</label>
                            <input type="text" value={serviceAtt5} onChange={(e) => setServiceAtt5(e.target.value)} placeholder='Provider Address' />
                        </div>
                        
                        <h2>Check to include Service Attributes</h2>
                        {options.map((option,index) => (
                            <div key={option}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={option}
                                        onChange={handleChange}
                                        checked={selectedOptions.includes(option)}
                                    />
                                    {option}
                                </label>
                                <input
                                    type="text"
                                    // value={attReference[index]}
                                    onChange={(e)=>handleRefInput(e,index)}
                                    
                                />
                            </div>
                        ))}
                        <div className='d-flex justify-content-center mt-3'>
                            <button className='mx-5' onClick={() => encryptServiceData()}>Encrypt Service Token</button>
                        </div>
                    </div> : null}
            </div>
        </>

    )
}
