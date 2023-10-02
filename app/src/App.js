import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  
  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(()=>{
    console.log('provider ',provider)
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        console.log('account changed ')
        getAccounts();
      });
    }
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      const signer1 = await provider.getSigner();
      console.log('signer1 ',signer1);
      setSigner(signer1);
    }
  },[])
  
  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(document.getElementById('amount').value)
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    console.log('contract ',escrowContract);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <main className=''>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" defaultValue={"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}/>
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" defaultValue={"0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}/>
        </label>

        <label>
          Deposit Amount (in Ether)
          <input type="text" id="amount" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} loggedInUserAddress={account}/>;
          })}
        </div>
      </div>
    </main>
  );
}

export default App;
