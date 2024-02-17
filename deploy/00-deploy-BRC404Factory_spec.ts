/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen
} from '../scripts/deploy-utils';

const deployFn: DeployFunction = async (hre) => {
  await deployAndVerifyAndThen({
      hre,
      name: "BRC404Factory",
      contract: 'BRC404Factory',
      args: [],
  })
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['BRC404Factory']

export default deployFn
