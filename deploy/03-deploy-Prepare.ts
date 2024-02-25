/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen, getContractFromArtifact, waitForTx
} from '../scripts/deploy-utils';
import { ethers } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  
  const [deployer, owner] = await hre.ethers.getSigners();

  const BRC404Factory = await getContractFromArtifact(
    hre,
    "BRC404Factory",
    {
      signerOrProvider: deployer,
    }
  )

  const Erc404Nft = await getContractFromArtifact(
    hre,
    "ERC404NFT",
    {
      signerOrProvider: deployer,
    }
  )
  console.log("Erc404Nft", Erc404Nft.address)

  const btcTxId4: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d85'
  await waitForTx(
    BRC404Factory.mintBRC404("XRGB", deployer, ethers.utils.parseEther("65000"), btcTxId4)
  )
  console.log("Mint XRGB Successful...")

  await waitForTx(
    Erc404Nft.setBaseURI("https://api-dev.xrgb.xyz/api/nft/bnb/xrgb/metadata/")
  )
  console.log("setBaseURI XRGB Successful...")

  await waitForTx(
    Erc404Nft.setContractURI("https://api-dev.xrgb.xyz/api/nft/eth/xrgb/contract")
  )
  console.log("setContractURI XRGB Successful...")

  const erc404Addr = await BRC404Factory._ticker("XRGB")
  console.log(erc404Addr)

  const BRC404Contract = await hre.ethers.getContractAt("BRC404", erc404Addr);
  await waitForTx(BRC404Contract.connect(deployer).setApprovalForAll(Erc404Nft.address, true))
  console.log("success to setApprovalForAll")

  const openseaAddr = "0x1e0049783f008a0085193e00003d00cd54003c71"
  await waitForTx(BRC404Contract.connect(deployer).setApprovalForAll(openseaAddr, true))
  console.log("success to setApprovalForAll")

  const res = await BRC404Contract.connect(deployer).isApprovedForAll(deployer.address, Erc404Nft.address)
  console.log("setApprovalForErc404Nft res: ", res)
  const res1 = await BRC404Contract.connect(deployer).isApprovedForAll(deployer.address, openseaAddr)
  console.log("setApprovalForOpensea res: ", res1)

  console.log("start enable nfts...")
  await waitForTx(
    Erc404Nft.enableNFT([2, 3])
  )
  console.log("enableNFT nft Successful...")
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['Prepare']

export default deployFn



//0x1e0049783f008a0085193e00003d00cd54003c71