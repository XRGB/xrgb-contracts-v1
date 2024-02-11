import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    userTwo,
    mintAmount,
    burnAmount,
    mintAmount1,
    userAddress,
    deployer,
    brc404Factory,
    ticker,
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
    const btcTxId: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d81'
    const btcTxId1: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d82'
    const btcTxId2: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d83'
    const btcTxId3: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d84'
    const btcAddress: string = 'tb1ppx05dj7lamhlf9a33ut82ld9qvp9mgtddwe7kqgg6jyppscshn6qm2926a'

    context('Generic', function () {
        beforeEach(async function () {
            const maxSupply = ethers.utils.parseEther("10000")
            const units = ethers.utils.parseEther("1")

            const receipt = await waitForTx(
                brc404Factory.connect(deployer).createBRC404(ticker, symbol, decimals, maxSupply, units)
            );
            expect(receipt.logs.length).to.eq(1, `Expected 1 events, got ${receipt.logs.length}`);
            const event = findEvent(receipt, 'BRC404Created');
            brc404Address = event.args[0];

            let brc20Contract = BRC404__factory.connect(brc404Address, user);
            expect( await brc20Contract.units()).to.equal(units);
        });

        context('Negatives', function () {

            it('User should fail to mint BRC40 if use same btcTxId.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.be.revertedWithCustomError(brc404Factory, ERRORS.ALREADYMINT)
            });

            it('User should fail to burn BRC40 if fee not enough.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 1, userTwoAddress
                ,{value: 1000})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDFEE)
            });

            it('User should fail to burn BRC404 if burnBRC404 to same chainid.',   async function () {
                const fee = ethers.utils.parseEther("0.03")
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 31337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC404 if chainid not support.',   async function () {
                const fee = ethers.utils.parseEther("0.03")
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 337, userTwoAddress
                ,{value: fee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if mint BRC404 success.',   async function () {
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc20Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(2)).to.equal(userAddress);
            });
            it('Get correct variable if burn BRC40 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc404Factory.connect(deployer).setSupportChain(btcChainId, true)).to.not.be.reverted

                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc20Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(2)).to.equal(userAddress);

                // expect( await brc20Contract.approve(brc404Factory.address, mintAmount)).to.not.be.reverted;
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, burnAmount, btcChainId, btcAddress, {value: ethers.utils.parseEther('0.03')}
                )).to.be.not.reverted;
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(burnAmount);
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
            });

            it('Get correct tokenid variable if Mint and burn BRC40 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc404Factory.connect(deployer).setSupportChain(btcChainId, true)).to.not.be.reverted

                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId1
                )).to.not.be.reverted

                let brc20Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(mintAmount.mul(2));
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(4);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(2)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(3)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(4)).to.equal(userAddress);

                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, burnAmount, btcChainId, btcAddress, {value: ethers.utils.parseEther('0.03')}
                )).to.be.not.reverted;
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(burnAmount.mul(3));
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(3);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(2)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(3)).to.equal(userAddress);

                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount1, btcChainId, btcAddress, {value: ethers.utils.parseEther('0.03')}
                )).to.be.not.reverted;
                expect( await brc20Contract.balanceOf(userAddress)).to.equal(ethers.utils.parseEther('2.5'));
                expect( await brc20Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc20Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc20Contract.ownerOf(2)).to.equal(userAddress);

                brc20Contract = BRC404__factory.connect(brc404Address, userTwo);
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userTwoAddress, mintAmount1, btcTxId2
                )).to.not.be.reverted
                expect( await brc20Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1);
                expect( await brc20Contract.erc721BalanceOf(userTwoAddress)).to.equal(0);
                await expect(brc404Factory.connect(deployer).mintBRC404(
                    ticker, userTwoAddress, mintAmount1, btcTxId3
                )).to.not.be.reverted
                expect( await brc20Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1.mul(2));
                expect( await brc20Contract.erc721BalanceOf(userTwoAddress)).to.equal(1);
                expect( await brc20Contract.ownerOf(5)).to.equal(userTwoAddress);
            });
        })
    })
})