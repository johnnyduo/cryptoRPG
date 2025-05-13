import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { ethers } from 'ethers';
import Button from './components/button';

import DialogManager from './features/dialog-manager';
import FloorCounter from './components/floor-counter';
import Footer from './components/footer';
import GameMenus from './features/game-menus';
import World from './features/world';
import Viewport from './components/viewport';
import useGameViewportScaling from './features/app-state/actions/use-game-viewport-scaling';
import Spellbook from './features/spellbook';
import Tutorial from './features/tutorial';
import Abilities from './features/abilities';
import JournalSide from './components/journal-side';

// Updated WalletButton with more robust handling
const WalletButton = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [error, setError] = useState(null);

    // Get wallet context with fallback values
    const { 
        account = '', 
        balance = '0', 
        isConnected = false,
        connectWallet,
        disconnectWallet
    } = window.ethersContext || {};

    const handleConnect = async () => {
        if (isConnecting || isDisconnecting) return;
        
        setIsConnecting(true);
        setError(null);
        
        try {
            if (window.ethersContext && connectWallet) {
                const success = await connectWallet();
                if (!success) {
                    setError("Failed to connect wallet");
                }
            } else {
                setError("Wallet context not available");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setError("Error connecting: " + (error.message || "Unknown error"));
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (isConnecting || isDisconnecting) return;
        
        setIsDisconnecting(true);
        
        try {
            if (window.ethersContext && disconnectWallet) {
                await disconnectWallet();
                // Force a small delay to ensure state updates
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const formatAddress = (address) => {
        return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
    };

    const buttonStyle = {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
    };

    // Show error if there is one
    if (error) {
        return (
            <div style={{ ...buttonStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div 
                    className="button__container white-border"
                    style={{ backgroundColor: '#ff3333', marginBottom: '5px' }}
                >
                    {error}
                </div>
                <div 
                    className="button__container white-border"
                    onClick={() => setError(null)}
                    style={{ cursor: 'pointer' }}
                >
                    Try Again
                </div>
            </div>
        );
    }

    // Not connected state
    if (!isConnected) {
        return (
            <div 
                className="button__container white-border"
                onClick={handleConnect}
                style={{ 
                    ...buttonStyle, 
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    opacity: isConnecting ? 0.7 : 1
                }}
            >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </div>
        );
    }

    // Connected state
    return (
        <div style={{ ...buttonStyle, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="button__container white-border" style={{ marginBottom: '5px' }}>
                <div>{formatAddress(account)}</div>
                <div>{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
            <div 
                className="button__container white-border"
                onClick={handleDisconnect}
                style={{ 
                    cursor: isDisconnecting ? 'not-allowed' : 'pointer', 
                    backgroundColor: isDisconnecting ? '#555' : '#333',
                    opacity: isDisconnecting ? 0.7 : 1
                }}
            >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </div>
        </div>
    );
};

// EthersProvider component with improved wallet state management
export function EthersProvider({ children }) {
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [balance, setBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState('0');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const contractAddress = "0x1ce14fD9dd6678fC3d192f02207d6ff999B04037"; // CryptoRPG token address
    const opSepoliaChainId = 11155420; // OP Sepolia Chain ID

    // Function to update balances - extracted for reuse
    const updateBalances = useCallback(async (address, ethersProvider) => {
        if (!address || !ethersProvider) return;
        
        try {
            // Get ETH balance
            const balanceWei = await ethersProvider.getBalance(address);
            setBalance(ethers.formatEther(balanceWei));
            
            // Get token balance
            try {
                const tokenContract = new ethers.Contract(
                    contractAddress,
                    ["function balanceOf(address) view returns (uint256)"],
                    ethersProvider
                );
                
                const tokenBalanceWei = await tokenContract.balanceOf(address);
                setTokenBalance(ethers.formatEther(tokenBalanceWei));
            } catch (err) {
                console.error("Error fetching token balance:", err);
            }
        } catch (err) {
            console.error("Error fetching ETH balance:", err);
        }
    }, [contractAddress]);

    // Initialize ethers and check for existing connection
    useEffect(() => {
        let mounted = true;
        
        const checkConnection = async () => {
            if (!window.ethereum) return;
            
            try {
                // Create provider
                const ethersProvider = new ethers.BrowserProvider(window.ethereum);
                if (mounted) setProvider(ethersProvider);
                
                // Check for connected accounts
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (!mounted) return;
                
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    
                    // Check network
                    const network = await ethersProvider.getNetwork();
                    const chainId = Number(network.chainId);
                    
                    if (chainId === opSepoliaChainId) {
                        await updateBalances(accounts[0], ethersProvider);
                    } else {
                        console.log("Not on OP Sepolia network");
                    }
                }
            } catch (error) {
                console.error("Error initializing ethers:", error);
                if (mounted) setConnectionError("Failed to initialize wallet connection");
            }
        };
        
        checkConnection();
        
        // Set up event listeners for account and chain changes
        if (window.ethereum) {
            const handleAccountsChanged = async (accounts) => {
                if (!mounted) return;
                
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    
                    if (provider) {
                        await updateBalances(accounts[0], provider);
                    }
                } else {
                    setAccount('');
                    setIsConnected(false);
                    setBalance('0');
                    setTokenBalance('0');
                }
            };
            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => {
                if (mounted) window.location.reload();
            });
            
            return () => {
                mounted = false;
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeAllListeners('chainChanged');
                }
            };
        }
        
        return () => {
            mounted = false;
        };
    }, [updateBalances]);

    // Connect wallet function with improved error handling
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed!');
            return false;
        }
        
        try {
            setConnectionError(null);
            
            // Request accounts
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Check and switch network if needed
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (parseInt(chainId, 16) !== opSepoliaChainId) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${opSepoliaChainId.toString(16)}` }],
                    });
                } catch (switchError) {
                    // Network not added yet
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: `0x${opSepoliaChainId.toString(16)}`,
                                        chainName: 'Optimism Sepolia Testnet',
                                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                                        rpcUrls: ['https://sepolia.optimism.io'],
                                        blockExplorerUrls: ['https://sepolia-optimism.etherscan.io/'],
                                    },
                                ],
                            });
                        } catch (addError) {
                            console.error("Error adding network:", addError);
                            setConnectionError("Failed to add network");
                            return false;
                        }
                    } else {
                        console.error("Error switching network:", switchError);
                        setConnectionError("Failed to switch network");
                        return false;
                    }
                }
            }
            
            // Get updated accounts after network switch
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                setIsConnected(true);
                
                // Update provider and get balance
                const ethersProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(ethersProvider);
                
                await updateBalances(accounts[0], ethersProvider);
                return true;
            }
            
            setConnectionError("No accounts available after connection");
            return false;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setConnectionError(error.message || "Unknown error connecting wallet");
            return false;
        }
    }, [opSepoliaChainId, updateBalances]);

    // Disconnect wallet function
    const disconnectWallet = useCallback(() => {
        setAccount('');
        setIsConnected(false);
        setBalance('0');
        setTokenBalance('0');
        
        // Force a small delay to ensure state updates properly
        setTimeout(() => {
            console.log('Wallet disconnected');
        }, 100);
        
        return true;
    }, []);

    // Make wallet state and functions available to children
    const ethersContext = {
        account,
        provider,
        balance,
        tokenBalance,
        isConnected,
        connectionError,
        connectWallet,
        disconnectWallet
    };

    // Add ethersContext to window for easy access from anywhere
    window.ethersContext = ethersContext;
    
    return (
        <>
            {children}
            <WalletButton />
        </>
    );
}

// Main App component
const App = ({ appState, world, dialog }) => {
    useGameViewportScaling();

    // Add click handlers to all "Connect Wallet" buttons with improved error handling
    useEffect(() => {
        const setupWalletButtons = () => {
            const buttons = document.querySelectorAll('.button__container.white-border');

            buttons.forEach(button => {
                // Skip buttons that already have handlers or don't match our criteria
                if (button.hasAttribute('data-wallet-handler')) return;
                
                const buttonText = button.textContent || '';
                if (!buttonText.includes('Connect Wallet')) return;
                
                // Mark this button as processed
                button.setAttribute('data-wallet-handler', 'true');

                // Add click event listener
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Use the ethersContext from window
                    if (window.ethersContext && window.ethersContext.connectWallet) {
                        try {
                            const success = await window.ethersContext.connectWallet();
                            if (success) {
                                console.log('Wallet connected:', window.ethersContext.account);
                                
                                // Safely update button text
                                try {
                                    const textElement = button.querySelector('.button__text');
                                    if (textElement && window.ethersContext.account) {
                                        const addressText = `${window.ethersContext.account.substring(0, 6)}...${window.ethersContext.account.substring(window.ethersContext.account.length - 4)}`;
                                        textElement.textContent = `Connected: ${addressText}`;
                                    }
                                } catch (err) {
                                    console.error("Error updating button text:", err);
                                }
                            } else {
                                console.error("Failed to connect wallet");
                            }
                        } catch (error) {
                            console.error("Error in wallet connection:", error);
                        }
                    }
                });

                console.log('Added wallet handler to button:', buttonText);
            });
        };

        // Run initially with a delay to ensure DOM is loaded
        const initialTimeout = setTimeout(setupWalletButtons, 1000);

        // Set up a periodic check for new buttons
        const interval = setInterval(setupWalletButtons, 2000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    // disable scrolling of the page
    // prevents iOS Safari bouncing during movement
    useEffect(() => {
        disableBodyScroll(document.getElementById('react-rpg'));
        return clearAllBodyScrollLocks;
    }, []);

    const { sideMenu, journalSideMenu } = appState;
    const { gameMode, floorNum, currentMap } = world;
    const { gameStart, gameOver, gameRunning, journalSideMenuOpen } = dialog;

    const disableJournal =
        gameStart ||
        gameOver ||
        !gameRunning ||
        !journalSideMenu ||
                !journalSideMenu ||
        !journalSideMenuOpen;

    let showFooter = true;

    const nativeApp = window.location.search === '?nativeApp=true';
    // don't show the footer if on a mobile device
    // or using the native app query param
    if (nativeApp || isMobile) {
        showFooter = false;
    }

    if (sideMenu) {
        return (
            <EthersProvider>
                <div className={`centered flex-row`}>
                    <JournalSide disabled={disableJournal} />
                    <div className={`centered ${sideMenu ? 'flex-row' : 'flex-column'}`}>
                        <div className={'centered flex-row'}>
                            <Viewport>
                                <World />
                                <DialogManager />
                                <Tutorial />
                                <Abilities />
                                <Spellbook />

                                {gameMode === 'endless' ? (
                                    <FloorCounter floor={floorNum} />
                                ) : (
                                    currentMap && (
                                        <FloorCounter
                                            floor={currentMap.replace('_', '-')}
                                        />
                                    )
                                )}
                            </Viewport>
                        </div>

                        <GameMenus />
                    </div>
                </div>
                {showFooter && <Footer />}
            </EthersProvider>
        );
    }

    return (
        <EthersProvider>
            <div className={`centered flex-row`}>
                <div
                    style={{
                        float: 'left',
                        marginLeft: '-410px',
                        display: disableJournal ? 'none' : 'block',
                    }}
                >
                    <JournalSide disabled={disableJournal} />
                </div>
                <div className={`centered ${sideMenu ? 'flex-row' : 'flex-column'}`}>
                    <div className={'centered flex-row'}>
                        <Viewport>
                            <World />
                            <DialogManager />
                            <Tutorial />
                            <Abilities />
                            <Spellbook />

                            {gameMode === 'endless' ? (
                                <FloorCounter floor={floorNum} />
                            ) : (
                                currentMap && (
                                    <FloorCounter
                                        floor={currentMap.replace('_', '-')}
                                    />
                                )
                            )}
                        </Viewport>
                    </div>

                    <GameMenus />
                </div>
            </div>
            {showFooter && <Footer />}
        </EthersProvider>
    );
};

const mapStateToProps = ({ appState, world, dialog }) => ({
    appState,
    world,
    dialog,
});

export default connect(mapStateToProps)(App);