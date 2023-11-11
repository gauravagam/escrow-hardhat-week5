const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 8080;

app.use(cors());
app.use(express.json());

let escrowContractList = [];

app.get("/getEscrowContracts",async(req,res)=>{
    try {
        res.json({ contractList: escrowContractList });
    } catch (error) {
        console.error('error in /getEscrowContracts ',error);
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/saveEscrowContract",async(req,res)=>{
    try {
        const { contractDetailObj } = req.body;
        if(!contractDetailObj){
            return res.status(400).json({ message: "Parameter is missing."});
        }

        escrowContractList.push(contractDetailObj);
        res.status(200).json({ contractList: escrowContractList });
    } catch (error) {
        console.error('error in /saveEscrowContract ',error);
        res.status(500).json({message: "Something went wrong"});
    }
})

app.post("/updateContract",async(req,res)=>{
    try {
        const { contractAddress } = req.body;
        const contractObjIndex = escrowContractList.findIndex(contractObj=>contractObj.address===contractAddress);
        const contractObj = contractObjIndex>=0 ? escrowContractList[contractObjIndex] : {} ;
        if(req.body.isApproved){
            contractObj["isApproved"] = true;
        }
        if(req.body.isCancelled){
            contractObj["isCancelled"] = true;
        }
        escrowContractList?.splice(contractObjIndex,1,contractObj);
        res.status(200).json({ updatedContract: contractObj });
    } catch (error) {
        console.error('inside /updateContract ',error);
        res.status(500).json({message:"something went wrong"});
    }
})
app.listen(PORT,()=>{
    console.log('server is listening on ',PORT);
})