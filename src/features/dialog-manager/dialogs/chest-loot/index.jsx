import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { ethers, BrowserProvider } from 'ethers';

import Button from '../../../../components/button';
import MicroDialog from '../../../../components/micro-dialog';
import pickupItem from '../../../inventory/actions/pickup-item';
import openChest from '../../actions/open-chest';
import closeChestDialog from '../../actions/close-chest-dialog';
import CryptoRPGTokenABI from '../../../../CryptoRPGTokenABI.json';

import './styles.scss';

const ChestLoot = ({ dialog, pickupItem, openChest, closeChestDialog }) => {
    const { chestOpen } = dialog;
    const { gold, exp, item } = chestOpen || {};

    const [isClaimed, setIsClaimed] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimError, setClaimError] = useState(null);
    const [tokenReward, setTokenReward] = useState(0);
    const [rewardCalculated, setRewardCalculated] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(0);

    // Contract address from environment variable or fallback
    const contractAddress = import.meta.env.VITE_CRPG_TOKEN_ADDRESS || "0x1ce14fD9dd6678fC3d192f02207d6ff999B04037";

    // Calculate token reward with simple formula: gold + exp + random(1-20)
    const calculateReward = useCallback(() => {
        if (!gold && !exp) return 0;
        
        // Base values
        const baseGold = gold || 0;
        const baseExp = exp || 0;
        
        // Random bonus between 1 and 20
        const randomBonus = Math.floor(Math.random() * 20) + 1;
        setBonusAmount(randomBonus);
        
        // Calculate final reward: gold + exp + random bonus
        // We'll scale down the values to make them reasonable token amounts
        // Assuming gold and exp could be in the hundreds or thousands
        const scaleFactor = 0.01; // Adjust this based on your game's economy
        const finalReward = (baseGold + baseExp) * scaleFactor + randomBonus;
        
        // Round to 2 decimal places for cleaner display
        return Math.round(finalReward * 100) / 100;
    }, [gold, exp]);

    // Calculate reward when chest is opened
    useEffect(() => {
        if (chestOpen && !rewardCalculated) {
            const reward = calculateReward();
            setTokenReward(reward);
            setRewardCalculated(true);
        }
    }, [chestOpen, rewardCalculated, calculateReward]);

    useEffect(() => {
        if (!chestOpen) openChest();
    }, [chestOpen, openChest]);

    async function handleClaim() {
        if (isClaimed || isClaiming || tokenReward <= 0) return;

        try {
            setIsClaiming(true);
            setClaimError(null);

            console.log('Starting claim process...');

            // Request wallet connection
            if (!window.ethereum) {
                setClaimError('MetaMask is required to claim tokens.');
                console.error('MetaMask not detected.');
                return;
            }

            const provider = new BrowserProvider(window.ethereum);
            console.log('Provider initialized');

            // Request accounts
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const signer = await provider.getSigner();
            console.log('Signer obtained');
            
            const userAddress = await signer.getAddress();
            console.log('User address:', userAddress);

            const contract = new ethers.Contract(
                contractAddress,
                CryptoRPGTokenABI,
                signer
            );
            console.log('Contract initialized');

            // Generate a unique game ID for this claim
            const gameId = ethers.id(`chest-${Date.now()}-${userAddress}-${Math.random()}`);
            
            // Use claimGameReward instead of mint to prevent double claims
            const tx = await contract.claimGameReward(
                gameId,
                userAddress,
                ethers.parseEther(tokenReward.toString())
            );
            console.log('Transaction sent:', tx.hash);

            await tx.wait();
            console.log('Transaction confirmed');

            setIsClaimed(true);
            alert(`${tokenReward} CRPG tokens successfully claimed!`);
        } catch (error) {
            console.error('Error claiming tokens:', error);
            setClaimError(error.message || 'Failed to claim tokens');
            
            // Check for specific errors
            if (error.message?.includes('user rejected')) {
                setClaimError('Transaction was rejected');
            } else if (error.message?.includes('already claimed')) {
                setClaimError('Rewards already claimed for this chest');
                setIsClaimed(true);
            } else if (error.message?.includes('insufficient funds')) {
                setClaimError('Insufficient funds for gas');
            }
        } finally {
            setIsClaiming(false);
        }
    }

    function handleContinue() {
        closeChestDialog();
        pickupItem();
    }

    return (
        <MicroDialog onClose={closeChestDialog} onKeyPress={handleContinue}>
            <span className="chest-loot__title">{'Chest Loot!'}</span>

            <div className="flex-column chest-loot__contents">
                {gold !== 0 && (
                    <div className="flex-row chest-loot__value--spacing">
                        <span>{'Gold: '}</span>
                        <span className="gold-loot">{gold}</span>
                    </div>
                )}

                {exp !== 0 && (
                    <div className="flex-row chest-loot__value--spacing">
                        <span>{'Exp: '}</span>
                        <span className="exp-loot">{exp}</span>
                    </div>
                )}

                {item && (
                    <div className="flex-row chest-loot__item">
                        <div
                            style={{
                                backgroundImage: `url('${item.image}')`,
                                width: '40px',
                                height: '40px',
                            }}
                        />
                        <span className="flex-column chest-loot__item-name">
                            {item.name}
                        </span>
                    </div>
                )}
                
                {/* Token reward display with bonus highlight */}
                {tokenReward > 0 && (
                    <div className="flex-column" style={{ marginTop: '15px', alignItems: 'center' }}>
                        <div className="flex-row chest-loot__value--spacing">
                            <span>{'Token Reward: '}</span>
                            <span className="token-loot" style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                {tokenReward} CRPG
                            </span>
                        </div>
                        
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#FFD700', 
                            marginTop: '5px',
                            fontStyle: 'italic'
                        }}>
                            (Includes +{bonusAmount} bonus tokens!)
                        </div>
                    </div>
                )}
            </div>

            {claimError && (
                <div style={{ color: 'red', margin: '10px 0', fontSize: '14px' }}>
                    {claimError}
                </div>
            )}

            <div className="flex-column chest-loot__buttons">
                <Button
                    onClick={handleContinue}
                    title={item ? 'Pick Up' : 'Continue'}
                    icon={item ? 'hand-paper' : 'check'}
                />
                {tokenReward > 0 && (
                    <Button
                        onClick={handleClaim}
                        title={isClaimed ? 'Claimed' : isClaiming ? 'Claiming...' : 'Claim Tokens'}
                        icon="gift"
                        disabled={isClaimed || isClaiming}
                    />
                )}
            </div>
        </MicroDialog>
    );
};

const mapStateToProps = ({ dialog }) => ({ dialog });

const actions = { pickupItem, openChest, closeChestDialog };

export default connect(mapStateToProps, actions)(ChestLoot);