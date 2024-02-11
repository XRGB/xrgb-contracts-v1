import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    mintAmount,
    userAddress,
    deployer,
    brc404Factory,
    token,
    symbol,
    decimals,
    userTwoAddress
} from '../__setup.spec';
import {
    findEvent, waitForTx 
  } from '../helpers/utils';
import { ERRORS } from '../helpers/errors';
import { ethers } from 'hardhat';
import { BRC404__factory } from '../../typechain-types';

makeSuiteCleanRoom('Mint BRC404', function () {

    let brc404Address: string
    const txId: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d81'
    const btcTxId: string = 'tb1ppx05dj7lamhlf9a33ut82ld9qvp9mgtddwe7kqgg6jyppscshn6qm2926a'

    context('Generic', function () {
        beforeEach(async function () {
            const receipt = await waitForTx(
                brc404Factory.connect(deployer).createBRC404(token, symbol, decimals, 10000, 1)
            );
            expect(receipt.logs.length).to.eq(1, `Expected 1 events, got ${receipt.logs.length}`);
            const event = findEvent(receipt, 'BRC404Created');
            brc404Address = event.args[0];
        });

        context('Negatives', function () {

            it('User should fail to mint BRC40 if use same txId.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.be.revertedWithCustomError(brc404Factory, ERRORS.ALREADYMINT)
            });

            it('User should fail to burn BRC40 if fee not enough.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    token, mintAmount/2, 1, userTwoAddress
                ,{value: 1000})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDFEE)
            });

            it('User should fail to burn BRC404 if burnBRC404 to same chainid.',   async function () {
                const fee = ethers.utils.parseEther("0.03")
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    token, mintAmount/2, 31337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC404 if chainid not support.',   async function () {
                const fee = ethers.utils.parseEther("0.03")
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    token, mintAmount/2, 337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if mint BRC404 success.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted

                let brc20Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
            });
            it('Get correct variable if burn BRC40 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc404Factory.connect(deployer).setSupportChain(btcChainId, true)).to.not.be.reverted

                await expect(brc404Factory.connect(deployer).mintBRC404(
                    token, userAddress, mintAmount, txId
                )).to.not.be.reverted

                let brc20Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc20Contract.approve(brc404Factory.address, mintAmount)).to.not.be.reverted;
                await expect(brc404Factory.connect(user).burnBRC404(
                    token, mintAmount - 5, btcChainId, btcTxId, {value: ethers.utils.parseEther('0.03')}
                )).to.be.not.reverted;
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(5);
            });
        })
    })
})