/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen
} from '../scripts/deploy-utils';
import { ethers } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  
  const { deployer, owner } = await hre.getNamedAccounts()
  await deployAndVerifyAndThen({
      hre,
      name: "BRC404Factory",
      contract: 'BRC404Factory',
      args: [owner],
  })
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['BRC404Factory']

export default deployFn
