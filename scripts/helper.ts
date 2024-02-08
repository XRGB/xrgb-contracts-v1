import { ethers } from 'ethers'
import hre from 'hardhat';
import {
    getContractFromArtifact
  } from '../scripts/deploy-utils';

async function test() {
    const {deployer} = await hre.getNamedAccounts()
    const BRC20Factory = await getContractFromArtifact(
      hre,
      "BRC20Factory",
      {
        signerOrProvider: deployer,
      }
    )
    
    console.log("Create BRC20...")
    const ticker = "XXOD"
    const decimal = ethers.utils.parseEther("1")
    const maxSupply = ethers.utils.parseEther("21000000")
  
    await BRC20Factory.createBRC20(ticker, ticker, decimal, maxSupply)
    console.log("create BRC20 success...")
}


// let deployer = ethers.Wallet.createRandom();

// console.log(deployer.privateKey)

// console.log('-------------')

// console.log(deployer.address)


// const provider = new ethers.providers.JsonRpcProvider("https://rpc.goerli.linea.build");

// let wallet = new ethers.Wallet("0xe60d126738a90850312cd82e3dc9c40840a4406e3c5a16e88353038f4637e2ee", provider);

// let tx = {
//     to: "0x29F65cEac79954a10D9bF0E17A3d1c6eDDf3cDCf",
//     // Convert currency unit from ether to wei
//     value: ethers.utils.parseEther("0.01")
// }
// // Send a transaction
// wallet.sendTransaction(tx)
// .then((txObj) => {
//     console.log('txHash', txObj.hash)
//     // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
//     // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
// })
// 0xe60d126738a90850312cd82e3dc9c40840a4406e3c5a16e88353038f4637e2ee
// 0x7426049b2593c98b10ced2acb1020de96907473848706de659c7023feda4dbca
// 0xc7bc9e504b5c02fb9b7ef50e1bc4eb7d740010b05591cb4d9cddcf16d402788f
// -------------
// 0xcE1f977C028f83945AB6CFFDC8a5b2B834B0bdFF
// 0x29F65cEac79954a10D9bF0E17A3d1c6eDDf3cDCf
// 0x70b00A1002E2b299213B981A96A5edD8453DAD60