
import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import { Signer, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import {
  BRC20Factory,
  BRC20Factory__factory,
  Events,
  Events__factory
} from '../typechain-types';
import { SIGN_PRIVATEKEY } from './helpers/constants';
import {
  revertToSnapshot,
  takeSnapshot
} from './helpers/utils';

import hre from 'hardhat'

export let accounts: Signer[];
export let deployer: Signer;
export let user: Signer;
export let userTwo: Signer;
export let deployerAddress: string;
export let userAddress: string;
export let userTwoAddress: string;
export let brc20Factory: BRC20Factory;
export let eventsLib: Events;

export let abiCoder = hre.ethers.utils.defaultAbiCoder;
export let signWallet: Wallet;

export const BRC20Factory_NAME = 'XRGB';
export const token: string = 'XRGB';
export const symbol: string = "XRGB";
export const decimals = 10;
export const mintAmount = 10;
//export let brc20Address: string;

export function makeSuiteCleanRoom(name: string, tests: () => void) {
  describe(name, () => {
    beforeEach(async function () {
      await takeSnapshot();
    });
    tests();
    afterEach(async function () {
      await revertToSnapshot();
    });
  });
}

before(async function () {
  abiCoder = ethers.utils.defaultAbiCoder;
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  user = accounts[1];
  userTwo = accounts[2];

  deployerAddress = await deployer.getAddress();
  userAddress = await user.getAddress();
  userTwoAddress = await userTwo.getAddress();

  brc20Factory = await new BRC20Factory__factory(deployer).deploy();

  expect(brc20Factory).to.not.be.undefined;

  await expect(brc20Factory.connect(user).createBRC20("MoMo", "Momo", 18, 1000)).to.be.revertedWith("Ownable: caller is not the owner")
  await expect(brc20Factory.connect(user).withdraw(deployerAddress)).to.be.revertedWith("Ownable: caller is not the owner")
  await expect(brc20Factory.connect(user).setSupportChain(1)).to.be.revertedWith("Ownable: caller is not the owner")
  await expect(brc20Factory.connect(user).setFee(10000)).to.be.revertedWith("Ownable: caller is not the owner")

  await expect(brc20Factory.connect(deployer).setSupportChain(1)).to.not.be.reverted

  eventsLib = await new Events__factory(deployer).deploy();
});
