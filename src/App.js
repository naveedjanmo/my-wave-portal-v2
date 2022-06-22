import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

import { ethers } from 'ethers';

import abi from './utils/WavePortal.json';

import './styles/base.css';
import './styles/globals.css';

import Logo from './components/Logo';
import Nav from './components/Nav';

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
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

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
        // const waveTxn = await wavePortalContract.wave();
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

  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, []);

  function formatDate(timestamp) {
    return dayjs(timestamp).format('DD MMMM YYYY');
  }

  return (
    <>
      <header>
        <Logo />
        <Nav />
      </header>
      <section className="mainContainer">
        <div className="dataContainer">
          <div className="introWrap">
            <h1>Welcome to the waveportal!</h1>
            <div className="body-big">
              Use this site to wave at me through the Ethereum blockchain! Maybe
              include a message too?
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
              <button className="waveButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              // <button className="connected">{contractAddress}</button>
              <button className="waveButton" onClick={() => wave(message)}>
                Wave at me
              </button>
            )}
          </div>

          <div className="separator"></div>

          <h2>Waves</h2>

          {allWaves.map((wave, index, timestamp) => {
            return (
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
                      <div className="waveAddress">{wave.address}</div>
                    </div>
                  </div>
                </div>

                {/* <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div> */}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default App;
