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

makeSuiteCleanRoom('Mint BRC20', function () {

    let brc20Address: string
    const txId: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d81'
    const btcTxId: string = 'tb1ppx05dj7lamhlf9a33ut82ld9qvp9mgtddwe7kqgg6jyppscshn6qm2926a'

    context('Generic', function () {
        beforeEach(async function () {
            const receipt = await waitForTx(
                brc20Factory.connect(deployer).createBRC20(token, symbol, decimals, 1000)
            );
            expect(receipt.logs.length).to.eq(1, `Expected 1 events, got ${receipt.logs.length}`);
            const event = findEvent(receipt, 'BRC20Created');
            brc20Address = event.args[0];
        });

        context('Negatives', function () {

            it('User should fail to mint BRC20 if use same txId.',   async function () {
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.be.revertedWithCustomError(brc20Factory, ERRORS.ALREADYMINT)
            });

            it('User should fail to burn BRC20 if fee not enough.',   async function () {
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    token, mintAmount/2, 1, userTwoAddress
                ,{value: 1000})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDETH)
            });

            it('User should fail to burn BRC20 if burn to same chainid.',   async function () {
                const fee = ethers.utils.parseEther("0.01")
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    token, mintAmount/2, 31337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC20 if chainid not support.',   async function () {
                const fee = ethers.utils.parseEther("0.01")
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc20Factory.connect(user).burn(
                    token, mintAmount/2, 337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc20Factory, ERRORS.INVALIDCHAINID)
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if mint BRC20 success.',   async function () {
                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted

                let brc20Contract = BRC20__factory.connect(brc20Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
            });
            it('Get correct variable if burn BRC20 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc20Factory.connect(deployer).setSupportChain(btcChainId)).to.not.be.reverted

                await expect(brc20Factory.connect(deployer).mint(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted

                let brc20Contract = BRC20__factory.connect(brc20Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc20Contract.approve(brc20Factory.address, mintAmount)).to.not.be.reverted;
                await expect(brc20Factory.connect(user).burn(
                    token, mintAmount - 5, btcChainId, btcTxId, {value: ethers.utils.parseEther('0.001')}
                )).to.be.not.reverted;
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(5);
            });
        })
    })
})