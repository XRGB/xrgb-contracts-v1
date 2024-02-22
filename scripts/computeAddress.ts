
import { computePancakePoolAddress } from './shared/computePoolAddress';
async function main() {

  //eth mainnet
  const token0 = "0x5cc5E64AB764A0f1E97F23984E20fD4528356a6a";  //XRGB Token
  const token1 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";  //WETH

  const pancakePoolDeployer = "0x41ff9AA7e16B8B1a8a8dc4f0eFacd93D02d071c9";

  //caculate the pool address
  const expectedPoolAddress = computePancakePoolAddress(pancakePoolDeployer,
    [token0, token1],
    10000
  )
  console.log("expectedPoolAddress: ",expectedPoolAddress)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });