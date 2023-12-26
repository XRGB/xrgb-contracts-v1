import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    mintAmount,
    userAddress,
    deployer,
    brc20Factory,
    token,
    symbol,
    decimals,
    deployerAddress,
    userTwoAddress
} from '../__setup.spec';
import {
    buildMintSeparator, findEvent, waitForTx 
  } from '../helpers/utils';
import { ERRORS } from '../helpers/errors';
import { BRC20__factory } from '../../typechain-types';
import { ethers } from 'hardhat';

makeSuiteCleanRoom('Buy Key Subject', function () {

    let brc20Address: string
    const txId: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d81'

    context('Generic', function () {
        beforeEach(async function () {
            //await expect(brc20Factory.connect(deployer).createBRC20(token, symbol, decimals)).to.not.be.reverted;
            const receipt = await waitForTx(
                brc20Factory.connect(deployer).createBRC20(token, symbol, decimals)
            );
            expect(receipt.logs.length).to.eq(1, `Expected 1 events, got ${receipt.logs.length}`);
            const event = findEvent(receipt, 'BRC20Created');
            brc20Address = event.args[0];
        });

        context('Negatives', function () {

            it('User should fail to mint BRC20 if use same txId.',   async function () {
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);

                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.be.revertedWithCustomError(brc20Factory, ERRORS.ALREADYMINT)
            });

            it('User should fail to burn BRC20 if fee not enough.',   async function () {
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    brc20Address, mintAmount/2, 1, userTwoAddress
                ,{value: 1000})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDETH)
            });

            it('User should fail to burn BRC20 if burn to same chainid.',   async function () {
                const fee = ethers.utils.parseEther("0.01")
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    brc20Address, mintAmount/2, 31337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC20 if chainid not support.',   async function () {
                const fee = ethers.utils.parseEther("0.01")
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    brc20Address, mintAmount/2, 337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC20 if address invalid.',   async function () {
                const fee = ethers.utils.parseEther("0.01")
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    brc20Address, mintAmount/2, 1, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDEVMADDRESS)
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if mint BRC20 success.',   async function () {
                const sig = await buildMintSeparator(brc20Factory.address, token, brc20Address, userAddress, mintAmount, txId);
                await expect(brc20Factory.connect(deployer).mint(
                    brc20Address, userAddress, mintAmount, txId
                )).to.not.be.reverted

                let brc20Contract = BRC20__factory.connect(brc20Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
            });
        })
    })
})