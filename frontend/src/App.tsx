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
