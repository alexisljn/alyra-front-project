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
import {Route, Routes} from "react-router-dom";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import ErrorPage from "./components/ErrorPage";

interface UserContext {
    isLogged: boolean
    address: string
    chainId: number
    isAdmin: boolean
    toggleIsLogged: () => void,
    changeAddress: (address: string) => void,
}

const UserContext = createContext<UserContext>({
    isLogged: false,
    address: '',
    chainId: 0,
    isAdmin: false,
    toggleIsLogged: () => {},
    changeAddress: () => {}
});

function App() {

    const [isLogged, setIsLogged] = useState(false);

    const [address, setAddress] = useState("");

    const [isAdmin, setIsAdmin] = useState(false);

    const [chainId, setChainId] = useState(0);

    const [isLoading, setIsLoading] = useState(true);

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

    const initialization = useCallback(async () => {
        const {chainId} = await ContractManager.provider.getNetwork()

        setChainId(chainId);

        if (isChainIdCorrect(chainId)) {
            await ContractManager.attachToContract();
        } else {
            throw new Error("Bad network") //TODO
        }

        await handleAutoLogin();
    }, []);

    useEffect(() => {
        (async () => {
            if (window.hasOwnProperty('ethereum')) {
                ContractManager.setProvider()

                try {
                    await initialization()
                } catch (error) {
                    alert('Couldn\'t connect to contract'); //TODO reseau

                    console.error(error);
                }

                window.ethereum.on('chainChanged', (chainId: any) => {
                    setChainId(parseInt(ethers.BigNumber.from(chainId).toString()));
                });

                window.ethereum.on("accountsChanged", (accounts: any) => {
                    if (accounts[0] && typeof accounts[0] === "string") {
                        setAddress(accounts[0]);
                    }
                });

                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (isLoading) return; /* Initialization Guard */

        (async () => {
            if (isChainIdCorrect(chainId)) {
                await ContractManager.attachToContract();

                setIsAdmin(await ContractManager.isCurrentUserOwner(address));

                return;
            }

            ContractManager.resetContract();

            setIsAdmin(false);

            //TODO alert pour dire d'être sur le bon reseau
        })();
    }, [chainId]);

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
            <UserContext.Provider value={{isLogged, toggleIsLogged, address, changeAddress, isAdmin, chainId}}>
                <Header/>
                <div className="container-fluid">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="admin" element={<AdminPanel/>}/>
                        <Route path="*" element={<ErrorPage/>}/>
                    </Routes>
                </div>
            </UserContext.Provider>
        </>
    );
}

export {App, UserContext};
