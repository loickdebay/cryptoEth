import { EthProvider } from "./contexts/EthContext";
import React, { Component } from 'react';

import Intro from "./components/Intro/";
import Setup from "./components/Setup";
import Demo from "./components/Demo";
import Footer from "./components/Footer";

import Voting from "./contracts/Voting.json";
import RegisterVoters from "./components/RegisterVoters";
import Proposals from "./components/Proposals";
import VotingSession from "./components/VotingSession";
import Results from "./components/Results";

import getWeb3 from "./getWeb3"

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    userAddress: null,
    proposals: [],
    isOwner: false,
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3()

      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = Voting.networks[networkId]
      console.log("deployedNetwork", deployedNetwork)

      const instance = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork?.address
      )

         // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance })

      let account = this.state.accounts[0]

      this.setState({
        userAddress: account.slice(0, 6) + "..." + account.slice(38, 42),
      })

			// Check if the user is the owner
      const owner = await instance.methods.owner().call()
      if (account === owner) {
        this.setState({
          isOwner: true,
        })
      }

			// getProposals
      const proposals = await instance.methods
        .getProposals()
        .call({ from: accounts[0] })
      this.setState({
        proposals: proposals,
      })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.error(error)
    }
  }

  render() {
    const { contract } = this.state;

    return (
      <EthProvider>
        
        <div id="App">
          <h1>Application de vote</h1>
          {contract && (
            <div className="container">
              <RegisterVoters votingInstance={contract} />
              <Proposals votingInstance={contract} />
              <VotingSession votingInstance={contract} />
              <Results votingInstance={contract} />
            </div>
          )}
        </div>
      </EthProvider>
    );
  }
}

export default App;