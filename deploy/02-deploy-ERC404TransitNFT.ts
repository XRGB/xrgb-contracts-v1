/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen, getContractFromArtifact, waitForTx
} from '../scripts/deploy-utils';
import { ethers } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  
  const { deployer, owner } = await hre.getNamedAccounts()

  const BRC404Factory = await getContractFromArtifact(
    hre,
    "BRC404Factory",
    {
      signerOrProvider: owner,
    }
  )
  const erc404Addr = await BRC404Factory._ticker("XRGB")
  console.log(erc404Addr)
  await deployAndVerifyAndThen({
      hre,
      name: "ERC404TransitNFT",
      contract: 'ERC404TransitNFT',
      args: ["XRGB", "XRGB", erc404Addr],
  })
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['ERC404TransitNFT']

export default deployFn
