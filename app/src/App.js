import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import History from './History';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

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
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [arbiter,setArbiter] = useState("");
  const [beneficiary,setBeneficiary] = useState("");
  const [amount,setAmount] = useState("");
  
  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      const signer = await provider.getSigner();
      setSigner(signer);
      await getAllContractList(signer);
    }

    getAccounts();
  }, [account]);

  useEffect(()=>{
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        getAccounts();
      });
    }
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      const signer1 = await provider.getSigner();
      setSigner(signer1);
      await getAllContractList(signer1);
    }
  },[])
  
  async function newContract() {
    try {
      const value = ethers.utils.parseEther(amount)
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);
      window.alert('Contract has been deployed');
      let escrow = {
        address: escrowContract.address,
        arbiter,
        beneficiary,
        value: value.toString(),
        depositor: account
      };
      const apiResp = await fetch("http://localhost:8080/saveEscrowContract",{ 
        method: "post", 
        body: JSON.stringify({contractDetailObj:escrow}), 
        headers: {"Content-Type":"application/json" }
      });
      if(apiResp.status === 200){
        setArbiter("");
        setBeneficiary("");
        setAmount("");
        escrow = {
          ...escrow,
          handleApprove: async () => {
            escrowContract.on('Approved', async() => {
                await updateContract(escrowContract.address,true);
            });
    
            await approve(escrowContract, signer);
    
          },
          handleCancel: async ()=>{
            escrowContract.on('Cancel',async()=>{
              await updateContract(escrowContract.address,false,true);
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

  const getAllContractList = async (signerParam) =>{
    const contractListApiResp = await fetch("http://localhost:8080/getEscrowContracts", {method:"get"});
    const data = await contractListApiResp.json();
    let escrowsList = await Promise.allSettled(data?.contractList?.map(async(contractDetailObj)=>{
      const escrowContract = new ethers.Contract(contractDetailObj.address,Escrow.abi,signerParam);

        return {
            ...contractDetailObj,
            handleApprove: async () => {
              escrowContract.on('Approved', async () => {
                  await updateContract(escrowContract.address,true);
              });
              await approve(escrowContract, signer);
      
            },
            handleCancel: async ()=>{
              escrowContract.on('Cancel',async()=>{
                await updateContract(escrowContract.address,false,true);
              });
              await cancel(escrowContract, signer);
            }
        }
    }))
    escrowsList = escrowsList.map(promiseObj=>promiseObj.value)
    setEscrows(escrowsList);
  }

  const updateContract = async (contractAddress,isApproved,isCancelled=false)=>{
    const apiResp = await fetch("http://localhost:8080/updateContract",{ 
        method: "post", 
        body: JSON.stringify({ contractAddress, isApproved, isCancelled }), 
        headers: {"Content-Type":"application/json" }
      });
      if(apiResp.status===200){
        const apiRespJson = await apiResp.json();
        const escrowsList = [...escrows];
        const contractObjIndex = escrowsList?.findIndex(contractObj=>contractObj.address===contractAddress);
        escrowsList[contractObjIndex] = apiRespJson.updatedContract;
        setEscrows(escrowsList);
      } else {
        window.alert('contract data could not updated');
      }
  }

  return (
    <main className='flex flex-col w-full'>
      <h1 className='text-center'>Simple Escrow Contract</h1>
      <div className="contract flex-1 w-9/12 max-w-screen-md mx-auto rounded-md">
        <h2> New Contract </h2>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" 
            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
            onChange={e=>setArbiter(e.target.value)}
            value={arbiter}/>
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" 
            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
            onChange={e=>setBeneficiary(e.target.value)}
            value={beneficiary}/>
        </label>

        <label>
          Deposit Amount (in Ether)
          <input type="text" id="amount" 
            className="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
            onChange={e=>setAmount(e.target.value)}
            value={amount}/>
        </label>

        <div
          className="button rounded-md"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts flex-1 w-9/12 max-w-screen-md mx-auto rounded-md">
        <h2> Existing Contracts </h2>
        <History escrows={escrows} loggedInUserAddress={account}/>
      </div>
    </main>
  );
}

export default App;
