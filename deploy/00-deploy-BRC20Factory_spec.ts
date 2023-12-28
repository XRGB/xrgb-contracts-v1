/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen
} from '../scripts/deploy-utils';

const deployFn: DeployFunction = async (hre) => {
    await deployAndVerifyAndThen({
        hre,
        name: "BRC20Factory",
        contract: 'BRC20Factory',
        args: [],
    })
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['BRC20Factory']

export default deployFn
