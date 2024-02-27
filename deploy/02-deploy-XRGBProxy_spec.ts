/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers, upgrades } from 'hardhat';
import {
    getContractFromArtifact
} from '../scripts/deploy-utils';

const deployFn: DeployFunction = async (hre) => {
  
    const { deployer, owner } = await hre.getNamedAccounts()

    const BRC404Factory = await getContractFromArtifact(
        hre,
        "BRC404Factory",
        {
            signerOrProvider: owner,
        }
    )
    const erc404XRGB = await BRC404Factory._ticker("XRGB")
    console.log(erc404XRGB)

    const XRGBProxy = await ethers.getContractFactory("XRGBProxy");
    const name = "XRGB";
    const symbol = "XRGB";
    //const initialOwner = "0x9b6687C6632faaA65C97FCC3d665C1AB2105222c";
    //const erc404XRGB = "0x20563286E0f1A34D692512498Ac5086C2758A679";
    
    const deployTx = await upgrades.deployProxy(XRGBProxy, [name, symbol, deployer, erc404XRGB]);
    await deployTx.wait();
    console.log("XRGBProxy deployed to:", await deployTx.getAddress());

}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['XRGBProxy']

export default deployFn
