
import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import { Signer, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import {
  BRC404Factory,
  BRC404Factory__factory,
  Events,
  Events__factory
} from '../typechain-types';
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
export let brc404Factory: BRC404Factory;
export let eventsLib: Events;

export let abiCoder = hre.ethers.utils.defaultAbiCoder;
export let signWallet: Wallet;

export const BRC404Factory_NAME = 'XRGB';
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

  brc404Factory = await new BRC404Factory__factory(deployer).deploy();

  expect(brc404Factory).to.not.be.undefined;

  await expect(brc404Factory.connect(user).createBRC404("MoMo", "Momo", 18, 10000, 1)).to.be.reverted
  await expect(brc404Factory.connect(user).withdraw(deployerAddress)).to.be.reverted
  await expect(brc404Factory.connect(user).setSupportChain(1, true)).to.be.reverted
  await expect(brc404Factory.connect(user).setFee(10000)).to.be.reverted

  await expect(brc404Factory.connect(deployer).setSupportChain(1, true)).to.not.be.reverted

  eventsLib = await new Events__factory(deployer).deploy();
});
