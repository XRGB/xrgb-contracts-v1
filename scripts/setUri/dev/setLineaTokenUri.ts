import hre from 'hardhat';

async function main() {

  const [deployer, owner] = await hre.ethers.getSigners();

  const brc404Factory = "0x22B296E5F19574F8E41dC326Ab00d10B018817f4"; //BRC404Factory
  const baseUri = "https://api-dev.xrgb.xyz/api/nft/linea/xrgb/metadata/"

  const chainId = hre.network.config.chainId;
  if(chainId !== 59140){
    console.log("Error, not linea test network, please check..")
  }

  const ticker = "XRGB";
  const BRC404FactoryContract = await hre.ethers.getContractAt("BRC404Factory", brc404Factory);
  const setUriTransaction = await BRC404FactoryContract.connect(owner).setTokenURI(ticker, baseUri)
  await setUriTransaction.wait()
  console.log("linea test network setUriTransaction successful: uri = ", baseUri)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });