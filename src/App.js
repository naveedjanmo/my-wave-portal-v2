import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import abi from './utils/WavePortal.json';

import './styles/base.css';
import './styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import Logo from './components/Logo';
import Nav from './components/Nav';
import EthName from './components/EthName';

// TODO
// 3. Loading when processing transaction
// 4. Auto-update waves without having to reload the page
// 5. Form focus state highlight
// 7. Footer - repo, credit, course

const { chains, provider } = configureChains(
  [chain.rinkeby],
  [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState('');

  const contractAddress = '0xce863A6B77a8847A850390da094608ef2976F47d';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Buildspace connect wallet button
   */
  // const connectWallet = async () => {
  //   try {
  //     const { ethereum } = window;

  //     if (!ethereum) {
  //       alert('Get MetaMask!');
  //       return;
  //     }

  //     const accounts = await ethereum.request({
  //       method: 'eth_requestAccounts',
  //     });

  //     console.log('Connected', accounts[0]);
  //     setCurrentAccount(accounts[0]);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(message);
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  function formatDate(timestamp) {
    return dayjs(timestamp).format('DD MMMM YYYY');
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        coolMode
        chains={chains}
        theme={lightTheme({
          accentColor: '#C850C0',
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
        })}
      >
        <header>
          <Logo />
          <Nav />
        </header>
        <section className="mainContainer">
          <div className="dataContainer">
            <div className="introWrap">
              <h1>Welcome to the waveportal!</h1>
              <div className="body-big">
                Use this site to wave at me through the Ethereum blockchain!
                Maybe include a message too?
              </div>
            </div>

            <div className="waveWrap">
              <div className="textWrapper">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className=""
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                />
              </div>

              {/*
               * If there is no currentAccount render this button
               */}
              {!currentAccount ? (
                <button className="waveButton disabled">Wave at me</button>
              ) : (
                <button className="waveButton" onClick={() => wave(message)}>
                  Wave at me
                </button>
              )}
            </div>

            {allWaves.map((wave, index) => {
              return (
                <div className="waveList">
                  <div className="separator"></div>
                  <h2>Waves</h2>
                  <div className="waveCard" key={index}>
                    <img src="/wave-emoji.png" alt="wave emoji"></img>
                    <div className="waveCardWrap">
                      <div className="waveTimestamp">
                        <div></div>
                        {formatDate(wave.timestamp.toString())}
                      </div>
                      <div className="waveContent">
                        <div className="waveMessage">{wave.message}</div>
                        <div className="waveAddressWrap">
                          <div className="waveAddress">
                            <EthName address={wave.address} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default App;
