import { ethers, BigNumber, BigNumberish, constants} from 'ethers'
import hre from 'hardhat';
import bn from 'bignumber.js'
import { expect } from 'chai';
import { computePoolAddress } from './shared/computePoolAddress';
import { NonfungiblePositionManagerABI, swapRouterAPI, uniswapFactoryABI } from './shared/constant';
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
// returns the sqrt price as a 64x96
function encodePriceSqrt(reserve1: BigNumberish, reserve0: BigNumberish): BigNumber {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  )
}

function decodePriceSqrt(sqrtPriceX96: BigNumber): BigNumber {
  const sqrtPriceX96String = sqrtPriceX96.toString();
  const sqrtPriceX96BigNumber = new bn(sqrtPriceX96String);
  const token0Price = sqrtPriceX96BigNumber.div(new bn(2).pow(96)).pow(2);
  console.log("token0Price: ", token0Price.toString())
  return BigNumber.from(0) //BigNumber.from(token0Price.toString())
}

const getMinTick = (minTickerIndex: number, tickSpacing: number) => Math.ceil(minTickerIndex / tickSpacing) * tickSpacing
const getMaxTick = (maxTickerIndex: number, tickSpacing: number) => Math.floor(maxTickerIndex / tickSpacing) * tickSpacing

async function main() {

  const [deployer] = await hre.ethers.getSigners();
  const provider = ethers.getDefaultProvider();

  //goerli testnet
  const brc404Factory = "0x73dCa04e66CEe212B2101C0799F115e0117D02F9";
  const token0 = "0xa8e2d17388CE6Fa4a944CE362f9c299250921797";
  const token1 = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

  // const brc404Factory = "0xd0c11Fc959E22b8e9B69c97Ea3cD334d480ce203"; //BRC404Factory
  // const token0 = "0x5cc5E64AB764A0f1E97F23984E20fD4528356a6a";  //XRGB Token
  // const token1 = "0x4200000000000000000000000000000000000006";  //WETH

  const NonfungiblePositionManagerAddr = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1";
  //const swapRouterAddr = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const UniswapV3FactoryAddr = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";

  //caculate the pool address
  const expectedPoolAddress = computePoolAddress(UniswapV3FactoryAddr,
    [token0, token1],
    10000
  )
  console.log("expectedPoolAddress: ",expectedPoolAddress)

  //create UniswapV3 Pool //0.047619 usdt
  const price = encodePriceSqrt(47619, 29125900000);

  const NFTPositionManagerContract = new ethers.Contract(NonfungiblePositionManagerAddr, NonfungiblePositionManagerABI, provider);
  const initializePoolTransaction = await NFTPositionManagerContract.connect(deployer).createAndInitializePoolIfNecessary(token0, token1, 10000, price)
  await initializePoolTransaction.wait();

  //Check the Pool address
  const SwapFactoryContract = new ethers.Contract(UniswapV3FactoryAddr, uniswapFactoryABI, provider);
  const poolAddress = await SwapFactoryContract.connect(deployer).getPool(token0, token1, 10000);
  expect(expectedPoolAddress).to.eq(poolAddress)

  const ticker = "XRGB";
  const BRC404FactoryContract = await hre.ethers.getContractAt("BRC404Factory", brc404Factory);
  const setWhitelistTransaction = await BRC404FactoryContract.connect(deployer).setWhitelist(ticker, poolAddress, true)
  await setWhitelistTransaction.wait()
  console.log("setWhitelist successful: ", poolAddress)

  //approve token to NonfungiblePositionManagerAddr
  const BRC404Contract = await hre.ethers.getContractAt("BRC404", token0);
  const approveTx = await BRC404Contract.connect(deployer).approve(NonfungiblePositionManagerAddr, constants.MaxUint256);
  await approveTx.wait();
  console.log("approve XRGB to NonfungiblePositionManagerAddr successful.");
  //check amount
  const getApproveAmount = await BRC404Contract.connect(deployer).allowance(deployer.address, NonfungiblePositionManagerAddr);
  expect(getApproveAmount).to.eq(constants.MaxUint256)
 
  //add 150000 XRGB in price, 0.054 ～ 0.104 USDT
  console.log("start to add liquidity 0.")
  const mintTransaction = await NFTPositionManagerContract.connect(deployer).mint({
          token0: token0, 
          token1: token1, 
          fee: 10000, 
          tickLower: getMinTick(-109000, 200), 
          tickUpper: getMaxTick(-102400, 200), 
          amount0Desired: ethers.utils.parseEther("150000"), 
          amount1Desired: 0, 
          amount0Min: 0,
          amount1Min: 0, 
          recipient: deployer.address, 
          deadline: 1716128564
  })
  await mintTransaction.wait();

  //add 500000 XRGB in price, 0.104 ～ 0.204 USDT
  console.log("start to add liquidity 1.")
  const mintTransaction1 = await NFTPositionManagerContract.connect(deployer).mint({
          token0: token0, 
          token1: token1, 
          fee: 10000, 
          tickLower: getMinTick(-102400, 200), 
          tickUpper: getMaxTick(-95600, 200), 
          amount0Desired: ethers.utils.parseEther("500000"), 
          amount1Desired: 0, 
          amount0Min: 0,
          amount1Min: 0, 
          recipient: deployer.address, 
          deadline: 1716128564
  })
  await mintTransaction1.wait();
  console.log("add liquidity 1 successful.")

  //add 650000 XRGB in price, 0.204 ～ 0.404 USDT
  console.log("start to add liquidity 2.")
  const mintTransaction2 = await NFTPositionManagerContract.connect(deployer).mint({
          token0: token0, 
          token1: token1, 
          fee: 10000, 
          tickLower: getMinTick(-95600, 200), 
          tickUpper: getMaxTick(-88800, 200), 
          amount0Desired: ethers.utils.parseEther("650000"), 
          amount1Desired: 0, 
          amount0Min: 0,
          amount1Min: 0, 
          recipient: deployer.address, 
          deadline: 1716128564
  })
  await mintTransaction2.wait();
  console.log("add liquidity 2 successful.")

  //add 300000 XRGB in price, 0.404 ～ 4.04 USDT
  console.log("start to add liquidity 3.")
  const mintTransaction3 = await NFTPositionManagerContract.connect(deployer).mint({
          token0: token0, 
          token1: token1, 
          fee: 10000, 
          tickLower: getMinTick(-88800, 200), 
          tickUpper: getMaxTick(-65800, 200), 
          amount0Desired: ethers.utils.parseEther("300000"), 
          amount1Desired: 0, 
          amount0Min: 0, 
          amount1Min: 0, 
          recipient: deployer.address, 
          deadline: 1716128564
  })
  await mintTransaction3.wait();
  console.log("add liquidity 3 successful.")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });