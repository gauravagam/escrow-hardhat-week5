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

app.listen(PORT,()=>{
    console.log('server is listening on ',PORT);
})