import hre from 'hardhat';

async function main() {

  const [deployer, owner] = await hre.ethers.getSigners();

  const brc404Factory = "0xd0c11Fc959E22b8e9B69c97Ea3cD334d480ce203"; //BRC404Factory
  const baseUri = "https://api.xrgb.xyz/api/nft/bnb/xrgb/metadata/"

  const chainId = hre.network.config.chainId;
  if(chainId !== 56){
    console.log("Error, not bnb main network, please check..")
  }

  const ticker = "XRGB";
  const BRC404FactoryContract = await hre.ethers.getContractAt("BRC404Factory", brc404Factory);
  const setUriTransaction = await BRC404FactoryContract.connect(owner).setTokenURI(ticker, baseUri)
  await setUriTransaction.wait()
  console.log("bnb main network setUriTransaction successful: uri = ", baseUri)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });