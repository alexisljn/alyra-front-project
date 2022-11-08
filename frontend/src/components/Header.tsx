import React, {useContext} from "react";
import {UserContext} from "../App";

function Header() {
    const {isLogged, provider, changeAddress, address, toggleIsLogged} = useContext(UserContext);

    const connectWallet =  async () => {
        if (provider !== null) {
            try {
                const accounts: string[] = await provider.send("eth_requestAccounts", []);
                changeAddress(accounts[0]);
                toggleIsLogged();
                window.localStorage.setItem(`@${accounts[0]}`, JSON.stringify(''));
            } catch (error) {
                console.error(error); // Logging for user
            }

            return;
        }

        alert('You need metamask to connect your wallet');
    }

    const disconnectWallet = () => {
        localStorage.removeItem(`@${address}`);
        changeAddress('');
        toggleIsLogged();
    }

    return (
        <nav className="navbar bg-light">
            <div className="container-fluid">
                <a href="#" className="navbar-brand">Voting App</a>
                {!isLogged
                    ?
                        <button className="btn btn-primary" onClick={connectWallet}>Connect wallet</button>
                    :
                        <div className="d-flex align-items-center">
                            <div>
                                <p style={{position: "relative", top: "20%"}}>{address}</p>
                            </div>
                            <div style={{marginLeft: 5}}>
                                <button className="btn btn-danger" onClick={disconnectWallet}>Disconnect</button>
                            </div>
                        </div>
                }
            </div>
        </nav>
    )
}

export default Header;
