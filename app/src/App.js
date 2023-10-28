import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import History from './History';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

async function cancel(escrowContract, signer){
  const cancelTx = await escrowContract.connect(signer).cancel();
  await cancelTx.wait();
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
    getAllContractList();
  },[])
  
  async function newContract() {
    try {
      const beneficiary = document.getElementById('beneficiary').value;
      const arbiter = document.getElementById('arbiter').value;
      const value = ethers.utils.parseEther(document.getElementById('amount').value)
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);
      console.log('contract ',escrowContract);
  
      const escrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: value.toString()
      };
      const apiResp = await fetch("http://localhost:8080/saveEscrowContract",{ 
        method: "post", 
        body: JSON.stringify({contractDetailObj:escrow}), 
        headers: {"Content-Type":"application/json" }
      });
      if(apiResp.status === 200){
        escrow = {
          ...escrow,
          handleApprove: async () => {
            escrowContract.on('Approved', () => {
              document.getElementById(`${escrowContract.address}_approve`).className =
                'complete';
              document.getElementById(`${escrowContract.address}_approve`).innerText =
                "✓ It's been approved!";
            });
    
            await approve(escrowContract, signer);
    
          },
          handleCancel: async ()=>{
            escrowContract.on('Cancel',()=>{
              console.log('tx cancelled');
            });
            await cancel(escrowContract, signer);
          }
        };
        setEscrows([...escrows, escrow]);
      } else {
        window.alert("Contract could not be saved");
      }
    } catch (error) {
      window.alert(error.message);
    }
  }

  const getAllContractList = async () =>{
    const contractListApiResp = await fetch("http://localhost:8080/getEscrowContracts", {method:"get"});
    const data = await contractListApiResp.json();
    const escrowsList = data.contractList.map((contractDetailObj)=>{
        return {
            ...contractDetailObj,
            handleApprove: ()=>{},
            handleCancel: ()=>{}
        }
    })
    setEscrows(escrowsList);
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

        <History escrows={escrows} loggedInUserAddress={account}/>
      </div>
    </main>
  );
}

export default App;
