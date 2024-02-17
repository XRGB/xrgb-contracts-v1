/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  getContractFromArtifact, waitForTx
} from '../scripts/deploy-utils';
import { ethers } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {

  const [deployer] = await ethers.getSigners();

  const BRC404Factory = await getContractFromArtifact(
    hre,
    "BRC404Factory",
    {
      signerOrProvider: deployer.address,
    }
  )

  await waitForTx(
    BRC404Factory.createBRC404("XRGB", "XRGB", 18, ethers.utils.parseEther("210000000"), ethers.utils.parseEther("21000"))
  )
  console.log("Deploy XRGB Successful...")

  await waitForTx(
    BRC404Factory.createBRC404("ORDI", "ORDI", 18, ethers.utils.parseEther("21000000"), ethers.utils.parseEther("2100"))
  )
  console.log("Deploy ORDI Successful...")

  await waitForTx(
    BRC404Factory.createBRC404("SATS", "SATS", 18, ethers.utils.parseEther("2100000000000000"), ethers.utils.parseEther("210000000000"))
  )
  console.log("Deploy SATS Successful...")

  await waitForTx(
    BRC404Factory.createBRC404("MUBI", "MUBI", 18, ethers.utils.parseEther("1000000000"), ethers.utils.parseEther("100000"))
  )
  console.log("Deploy MUBI Successful...")

  await waitForTx(
    BRC404Factory.createBRC404("RATS", "RATS", 18, ethers.utils.parseEther("1000000000000"), ethers.utils.parseEther("100000000"))
  )
  console.log("Deploy RATS Successful...")

  const owner = await BRC404Factory.owner();
  console.log("current owner is: ", owner)
  console.log("start transfer ownership...")
  const newOwner = '0x37c1E8a4dCbb721e9f756f45067D441B1e1cE419'
  await waitForTx(
    BRC404Factory.transferOwnership(newOwner)
  )
  const newowner = await BRC404Factory.owner();
  console.log("current owner is: ", newowner)
  console.log("transfer ownership sucessful.")
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['DeployTicker']

export default deployFn
