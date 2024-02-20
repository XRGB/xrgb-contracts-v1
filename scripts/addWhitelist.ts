import hre from 'hardhat';

async function main() {

  const [deployer, owner] = await hre.ethers.getSigners();

  const brc404Factory = "0xd0c11Fc959E22b8e9B69c97Ea3cD334d480ce203"; //BRC404Factory
  const whitelist = "0x74b29b11c376088c1055f64bd05af482de075d3c"

  const ticker = "XRGB";
  const BRC404FactoryContract = await hre.ethers.getContractAt("BRC404Factory", brc404Factory);
  const setWhitelistTransaction = await BRC404FactoryContract.connect(owner).setWhitelist(ticker, whitelist, true)
  await setWhitelistTransaction.wait()
  console.log("setWhitelist successful: ", whitelist)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });