import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [ownerName, setOwnerName] = useState(undefined);


  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      window.ethereum.on("accountsChanged", (accounts) => {
        handleAccount(accounts);
      });
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({method: "eth_accounts"});
      handleAccount(accounts);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getBalance();
    }
  }
  const checkOwner = async () => {
    if (atm) {
      const ownerName = await atm.checkOwner();
      setOwnerName(ownerName);
    }
    }
  

  
  

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p style={{fontFamily:"Sans-serif"}}>Your Account: {account}</p>
        <p style={{fontFamily:"Sans-serif"}}>Your Balance: {balance}</p>
        <p style={{fontFamily:"Sans-serif"}}>Owner Name: {ownerName}</p>

        <button style={{backgroundColor:"#cyan"}}  onClick={deposit}>Deposit 1 ETH</button>
        <button style={{backgroundColor:"yellow"}} onClick={withdraw}>Withdraw 1 ETH</button>
      </div>
    )
  }

  useEffect(() => {
    getWallet();
    checkOwner();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Crypto ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
        
      `}
      </style>
    </main>
  )
}
