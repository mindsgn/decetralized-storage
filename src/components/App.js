import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import { load } from 'dotenv';

//Declare IPFS
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({host:"ipfs.infura.io", port: 5001, protocol: "https"});

class App extends Component {
  //Set states
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      account: '',
      dstorage: null,
      files:[],
      type: null,
      name: null
    }

    this.uploadFile = this.uploadFile.bind(this)
    this.captureFile = this.captureFile.bind(this)
    //Bind functions
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    console.log(this.state.files);
  }

  async loadWeb3() {
    //Setting up Web3
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      console.log("web3 not supported");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //Declare Web3
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    //Load account

    //Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = DStorage.networks[networkId]
    if(networkData){
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address);
      this.setState({ dstorage });

      const filesCount = await dstorage.methods.fileCount().call();
      this.setState({ filesCount })

      for (var i = filesCount; i >= 1; i--){
        const file = await dstorage.methods.files(i).call()
        console.log("file", file);  
        this.setState({files: [...this.state.files, file]})
      }
    }else{
      console.log("contract not deployed to detect network")
    }
    this.setState({loading: false})
  }

  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
      })
      console.log('buffer', this.state.buffer)
    }
  }


  //Upload File
  uploadFile = description => {
    console.log("Submitting file to IPFS...")

    // Add file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result.size)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      // Assign value for the file without extension
      if(this.state.type === ''){
        this.setState({type: 'none'})
      }
      this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({
         loading: false,
         type: null,
         name: null
       })
       window.location.reload()
      }).on('error', (e) =>{
        window.alert('Error')
        this.setState({loading: false})
      })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              files={this.state.files}
              captureFile={this.captureFile}
              uploadFile={this.uploadFile}
            />
        }
      </div>
    );
  }
}

export default App;