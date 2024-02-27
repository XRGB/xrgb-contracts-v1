/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers, upgrades } from 'hardhat';
import {
    getContractFromArtifact
} from '../scripts/deploy-utils';

const deployFn: DeployFunction = async (hre) => {
  
    const { deployer, owner } = await hre.getNamedAccounts()

    const XRGBProxy = await ethers.getContractFactory("XRGBProxy");
    const name = "XRGB";
    const symbol = "XRGB";
    const erc404XRGB = "0x5cc5E64AB764A0f1E97F23984E20fD4528356a6a";
    const baseTokenURI = "https://api.xrgb.xyz/api/nft/eth/xrgb/metadata/";
    const contractURI = "https://api.xrgb.xyz/api/nft/eth/xrgb/contract";
    
    const deployTx = await upgrades.deployProxy(XRGBProxy, [name, symbol, baseTokenURI, contractURI, deployer, erc404XRGB]);
    console.log("XRGBProxy deployed to: ", deployTx.address);
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['DeployXRGBProxy']

export default deployFn
