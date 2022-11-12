import React, {createContext, useCallback, useEffect, useState} from 'react';
import './App.css';
import Header from "./components/Header";
import {
    DEFAULT_ADDRESS,
    getLastUsedAddress,
    isChainIdCorrect,
    saveAddressInLocalStorage
} from "./Util";
import {ContractManager} from "./managers/ContractManager";
import {ethers} from "ethers";

interface UserContext {
    isLogged: boolean
    address: string
    isAdmin: boolean
    toggleIsLogged: () => void,
    changeAddress: (address: string) => void,
}

const UserContext = createContext<UserContext>({
    isLogged: false,
    address: '',
    isAdmin: false,
    toggleIsLogged: () => {},
    changeAddress: () => {}
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [address, setAddress] = useState("");

    const [isAdmin, setIsAdmin] = useState(false);

    const toggleIsLogged = useCallback(() => {
        setIsLogged(isLogged => !isLogged);
    }, []);

    const changeAddress = useCallback((address: string) => {
        setAddress(address);
    }, []);

    const handleAutoLogin = useCallback(async () => {
        const lastUsedAddress = getLastUsedAddress();

        if (lastUsedAddress !== DEFAULT_ADDRESS) {
            setAddress(lastUsedAddress);

            toggleIsLogged();
        }
    }, [])

    useEffect(() => {
        (async () => {
            if (window.hasOwnProperty('ethereum')) {
                ContractManager.setProvider()

                try {
                    await ContractManager.attachToContract();

                    await handleAutoLogin();

                } catch (error) {
                    alert('Couldn\'t connect to contract');

                    console.error(error);
                }

                // events disconnect chainChanged accountsChanged
                window.ethereum.on('chainChanged', (e) => {
                    console.log(e) // e = chainId en hex
                    //TODO les appels onChain ne marcheront plus
                });

                window.ethereum.on("accountsChanged", (accounts: any) => {
                    if (accounts[0] && typeof accounts[0] === "string") {
                        setAddress(accounts[0]);
                    }
                });
            }
        })();
    }, []);

    useEffect(() => {
        if (isLoading) return; /* Initialization Guard */

        (async () => {
            saveAddressInLocalStorage(address);

            isChainIdCorrect(chainId)
                ? setIsAdmin(await ContractManager.isCurrentUserOwner(address))
                : setIsAdmin(false)
            ;
        })();
    }, [address])

    return(
        <>
            <UserContext.Provider value={{isLogged, toggleIsLogged, address, changeAddress, isAdmin}}>
                <Header/>
                <div className="container-fluid">
                <button className="btn btn-lg btn-primary">Test</button>
                </div>
            </UserContext.Provider>
        </>
    );
}

export {App, UserContext};
