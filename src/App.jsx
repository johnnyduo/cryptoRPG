import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { isMobile } from 'react-device-detect';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Button from './components/button';

// Import configuration
import { projectId, metadata, networks, wagmiAdapter, wagmiConfig } from './config';

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

// Initialize query client
const queryClient = new QueryClient();

// AppKit Provider component
export function AppKitProvider({ children }) {
    // Initialize AppKit inside useEffect to ensure it runs in browser environment
    useEffect(() => {
        try {
            createAppKit({
                adapters: [wagmiAdapter],
                networks,
                projectId,
                metadata,
                features: {
                    analytics: true
                }
            });
            console.log("AppKit initialized successfully");
        } catch (error) {
            console.error("Failed to initialize AppKit:", error);
        }
    }, []);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// Simple Connect Wallet Button component
const ConnectWalletButton = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    
    const handleConnectWallet = () => {
        if (isConnecting) return;
        
        setIsConnecting(true);
        
        // Create and use the AppKit button element
        try {
            // Create a container for the button
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '-1000px';
            container.style.left = '-1000px';
            
            // Create the button element
            const button = document.createElement('appkit-button');
            container.appendChild(button);
            document.body.appendChild(container);
            
            // Click the button
            button.click();
            
            // Clean up after a delay
            setTimeout(() => {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                }
                setIsConnecting(false);
            }, 1000);
        } catch (error) {
            console.error('Error with wallet connection:', error);
            setIsConnecting(false);
        }
    };

    return (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
            <Button
                title={isConnecting ? "Connecting..." : "Connect Wallet"}
                onClick={handleConnectWallet}
                disabled={isConnecting}
            />
        </div>
    );
};

// Main App component
const App = ({ appState, world, dialog }) => {
    useGameViewportScaling();

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
            <AppKitProvider>
                <div className={`centered flex-row`}>
                    <ConnectWalletButton />
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
            </AppKitProvider>
        );
    }

    return (
        <AppKitProvider>
            <div className={`centered flex-row`}>
                <ConnectWalletButton />
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
        </AppKitProvider>
    );
};

const mapStateToProps = ({ appState, world, dialog }) => ({
    appState,
    world,
    dialog,
});

export default connect(mapStateToProps)(App);