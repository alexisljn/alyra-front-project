import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import './App.css';
import {ethers, providers} from "ethers";
import Header from "./components/Header";
import {DEFAULT_ADDRESS, getLastUsedAddress, saveAddressInLocalStorage} from "./Util";

interface UserContext {
    isLogged: boolean
    address: string
    toggleIsLogged: () => void,
    changeAddress: (address: string) => void,
}

const UserContext = createContext<UserContext>({
    isLogged: false,
    address: '',
    toggleIsLogged: () => {},
    changeAddress: () => {}
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [address, setIsAddress] = useState("");

    const toggleIsLogged = useCallback(() => {
        setIsLogged(isLogged => !isLogged);
    }, []);

    const changeAddress = useCallback((address: string) => {
        setIsAddress(address);

        if (address !== "") {
            saveAddressInLocalStorage(address);
        }


    const handleAutoLogin = useCallback(() => {
        const lastUsedAddress = getLastUsedAddress();

        if (lastUsedAddress !== DEFAULT_ADDRESS) {

            changeAddress(lastUsedAddress);

            toggleIsLogged();
        }
    }, [])

    useEffect(() => {
        if (window.hasOwnProperty('ethereum')) {

            setIsProvider(new providers.Web3Provider(window.ethereum));

            handleAutoLogin();

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
