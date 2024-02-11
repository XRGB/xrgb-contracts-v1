/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import {
  deployAndVerifyAndThen
} from '../scripts/deploy-utils';
import { ethers } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {

  const [deployer] = await ethers.getSigners();
  let deployerNonce = await ethers.provider.getTransactionCount(deployer.address);
  // while(deployerNonce < 14){
  //   console.log("nonce: ", deployerNonce, " start transfer to self")
  //   await deployer.sendTransaction({
  //     to: deployer.address,
  //     value: ethers.utils.parseEther("0.001"),
  //   });
  //   deployerNonce++ // = await ethers.provider.getTransactionCount(deployer.address);
  // }
  console.log("nonce: ", deployerNonce, " start to deploy BRC404Factory..")
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
