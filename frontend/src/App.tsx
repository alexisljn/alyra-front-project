import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import './App.css';
import {ethers, providers} from "ethers";
import Header from "./components/Header";

interface UserContext {
    provider: providers.Web3Provider | null
    isLogged: boolean
    address: string
    toggleIsLogged: () => void,
    changeAddress: (address: string) => void,
}

const UserContext = createContext<UserContext>({
    provider: null,
    isLogged: false,
    address: '',
    toggleIsLogged: () => {},
    changeAddress: () => {}
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [provider, setIsProvider] = useState< providers.Web3Provider | null>(null);

    const [address, setIsAddress] = useState("");

    const toggleIsLogged = useCallback(() => {
        setIsLogged(isLogged => !isLogged);
    }, []);

    const changeAddress = useCallback((address: string) => {
        setIsAddress(address);
    }, [])

    useEffect(() => {
        if (window.hasOwnProperty('ethereum')) {

            setIsProvider(new providers.Web3Provider(window.ethereum));

            // events disconnect chainChanged accountsChanged
            window.ethereum.on('chainChanged', (e) => {
                console.log(e) // e = chainId en hex
            });

            window.ethereum.on("accountsChanged", (accounts: any) => {
                if (accounts[0] && typeof accounts[0] === "string") {
                    changeAddress(accounts[0]);
                }
            });
        }
    }, []);

    return(
        <>
            <UserContext.Provider value={{isLogged, provider, toggleIsLogged, address, changeAddress}}>
                <Header/>
                <div className="container-fluid">
                <button className="btn btn-lg btn-primary">Test</button>
                </div>
            </UserContext.Provider>
        </>
    );
}

export {App, UserContext};
