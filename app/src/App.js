import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import History from './History';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  const tx = await approveTxn.wait();
}

async function cancel(escrowContract, signer){
  const cancelTx = await escrowContract.connect(signer).cancel();
  await cancelTx.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);

  
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
      const beneficiary = document.getElementById('beneficiary').value;
      const arbiter = document.getElementById('arbiter').value;
      const value = ethers.utils.parseEther(document.getElementById('amount').value)
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);
  
      let escrow = {
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
            escrowContract.on('Approved', async() => {
              document.getElementById(`${escrowContract.address}_approve`).className =
                'complete';
              document.getElementById(`${escrowContract.address}_approve`).innerText =
                "✓ It's been approved!";
                document.getElementById(`${escrowContract.address}_cancel`).style = 'display:none';
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
      // const isApproved = await escrowContract.isApproved();
      // console.log('isApproved',isApproved)

        return {
            ...contractDetailObj,
            // isApproved,
            handleApprove: async () => {
              escrowContract.on('Approved', async () => {
                document.getElementById(`${escrowContract.address}_approve`).className =
                  'complete';
                document.getElementById(`${escrowContract.address}_approve`).innerText =
                  "✓ It's been approved!";
                  document.getElementById(`${escrowContract.address}_cancel`).style = 'display:none';
                  await updateContract(escrowContract.address,true);
              });
              console.log('before approve ',signer)
              await approve(escrowContract, signer);
      
            },
            handleCancel: async ()=>{
              escrowContract.on('Cancel',async()=>{
                document.getElementById(`${escrowContract.address}_cancel`).innerText = "X It's been cancelled!";
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
