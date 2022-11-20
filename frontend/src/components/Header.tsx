import React, {useContext} from "react";
import {UserContext} from "../App";
import {DEFAULT_ADDRESS, removeAddressFromLocalStorage} from "../Util";
import {ContractManager} from "../managers/ContractManager";
import {Link} from "react-router-dom";

function Header() {
    const {isLogged, changeAddress, address, toggleIsLogged, isAdmin} = useContext(UserContext);

    const connectWallet =  async () => {
        if (ContractManager.provider) {
            try {
                const accounts: string[] = await ContractManager.provider.send("eth_requestAccounts", []);

                changeAddress(accounts[0]);

                toggleIsLogged();
            } catch (error) {
                console.error(error); // Logging for user
            }

            return;
        }

        alert('You need metamask to connect your wallet');
    }

    const disconnectWallet = () => {
        removeAddressFromLocalStorage(address);

        changeAddress(DEFAULT_ADDRESS);

        toggleIsLogged();
    }

    return (
        <nav className="navbar bg-light navbar-expand-lg">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand">Voting App</Link>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link to={`/`} className="nav-link">Proposals</Link>
                    </li>
                    {isAdmin &&
                        <li className="nav-item">
                            <Link to={`admin`} className="nav-link">Admin</Link>
                        </li>
                    }
                </ul>
                {!isLogged
                    ?
                        <button className="btn btn-primary" onClick={connectWallet}>Connect wallet</button>
                    :
                        <div className="d-flex align-items-center">
                            <div>
                                <p style={{position: "relative", top: 10}}>{address}</p>
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
