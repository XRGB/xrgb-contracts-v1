import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    userTwo,
    mintAmount,
    burnAmount,
    mintAmount1,
    mintAmount2,
    userAddress,
    owner,
    brc404Factory,
    ticker,
    symbol,
    decimals,
    userTwoAddress,
    deployerAddress,
    deployer,
    ownerAddress,
    burnFee
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
    const btcTxId4: string = '3d122f7e3c6a65f72b1ca5f0a8d4a95d99e3c4f5e6d20743f52f2e01da024d85'
    const btcAddress: string = 'tb1ppx05dj7lamhlf9a33ut82ld9qvp9mgtddwe7kqgg6jyppscshn6qm2926a'

    context('Generic', function () {
        beforeEach(async function () {
            const maxSupply = ethers.utils.parseEther("210000000")
            const units = ethers.utils.parseEther("21000")

            const receipt = await waitForTx(
                brc404Factory.connect(owner).createBRC404(ticker, symbol, decimals, maxSupply, units)
            );
            expect(receipt.logs.length).to.eq(1, `Expected 1 events, got ${receipt.logs.length}`);
            const event = findEvent(receipt, 'BRC404Created');
            brc404Address = event.args[0];

            let brc404Contract = BRC404__factory.connect(brc404Address, user);
            expect( await brc404Contract.units()).to.equal(units);
        });

        context('Negatives', function () {

            it('User should fail to mint BRC40 if use same btcTxId.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.be.revertedWithCustomError(brc404Factory, ERRORS.ALREADYMINT)
            });

            it('User should fail to burn BRC40 if fee not enough.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 1, userTwoAddress
                ,{value: 1000})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDFEE)
            });

            it('User should fail to burn BRC404 if burnBRC404 to same chainid.',   async function () {
                
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 31337, userTwoAddress
                ,{value: burnFee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });

            it('User should fail to burn BRC404 if chainid not support.',   async function () {
                
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount, 337, userTwoAddress
                ,{value: burnFee})).to.be.revertedWithCustomError(brc404Factory, ERRORS.INVALIDCHAINID)
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if mint BRC404 success.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
            });

            it('Get correct variable if burn BRC40 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc404Factory.connect(owner).setSupportChain(btcChainId, true)).to.not.be.reverted

                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);

                expect(await ethers.provider.getBalance(brc404Factory.address)).to.equal(0);
                const userTwoAddressBeforeBalance = await ethers.provider.getBalance(userTwoAddress);

                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, burnAmount, btcChainId, btcAddress, {value: burnFee}
                )).to.be.not.reverted;
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect(await ethers.provider.getBalance(brc404Factory.address)).to.equal(burnFee);
                await expect(brc404Factory.connect(owner).withdraw(
                    userTwoAddress
                )).to.be.not.reverted;
                const userTwoAddressAfterBalance = await ethers.provider.getBalance(userTwoAddress);
                expect((userTwoAddressBeforeBalance).add(burnFee)).to.equal(userTwoAddressAfterBalance);
            });

            it('Get correct tokenid variable if Mint and burn BRC40 success.',   async function () {
                const btcChainId = ethers.constants.MaxUint256;
                await expect(brc404Factory.connect(owner).setSupportChain(btcChainId, true)).to.not.be.reverted

                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId1
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount.mul(2));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(4);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(3)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(4)).to.equal(userAddress);

                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, burnAmount, btcChainId, btcAddress, {value: burnFee}
                )).to.be.not.reverted;
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(burnAmount.mul(3));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(3);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(3)).to.equal(userAddress);

                await expect(brc404Factory.connect(user).burnBRC404(
                    ticker, mintAmount1, btcChainId, btcAddress, {value: burnFee}
                )).to.be.not.reverted;
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount1.mul(5));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);

                brc404Contract = BRC404__factory.connect(brc404Address, userTwo);
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userTwoAddress, mintAmount1, btcTxId2
                )).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(0);
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userTwoAddress, mintAmount1, btcTxId3
                )).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1.mul(2));
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(4)).to.equal(userTwoAddress);

                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userTwoAddress, mintAmount, btcTxId4
                )).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(burnAmount.mul(3));
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(3);
                expect( await brc404Contract.ownerOf(3)).to.equal(userTwoAddress);
                expect( await brc404Contract.ownerOf(4)).to.equal(userTwoAddress);
                expect( await brc404Contract.ownerOf(5)).to.equal(userTwoAddress);
            });

            it('Get correct variable if mint 10000000 BRC404 success.',   async function () {
                await expect(brc404Factory.connect(owner).setERC721TransferExempt(ticker, userAddress, true)).to.not.be.reverted
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount2, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);

                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount2);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(0);
            });

            it('Get correct variable if transfer token to others.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);

                await expect(brc404Contract.transfer(userTwoAddress, burnAmount)).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(2)).to.equal(userTwoAddress);
            });

            it('Get correct variable if transfer NFT to others.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                
                await expect(brc404Contract.transferFrom(userAddress, userTwoAddress, 1)).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userTwoAddress);
            });

            it('Get correct variable if set baseUri.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                expect( await brc404Contract.tokenURI(2)).to.equal('2');

                const baseUri = 'https://api.tinfun.com/metadata/'
                await expect(brc404Factory.connect(owner).setTokenURI(
                    ticker, baseUri
                )).to.not.be.reverted
                expect( await brc404Contract.tokenURI(2)).to.equal('https://api.tinfun.com/metadata/2');
            });

            it('Get correct variable if transfer mintAmount1 erc20.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                
                await expect(brc404Contract.transfer(userTwoAddress, mintAmount1)).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount.sub(mintAmount1));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(0);
            });

            it('Get correct variable if transfer burnAmount erc20.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                
                await expect(brc404Contract.transfer(userTwoAddress, mintAmount1)).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount.sub(mintAmount1));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(0);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                await expect( brc404Contract.ownerOf(2)).to.be.reverted

                await expect(brc404Contract.transfer(userTwoAddress, mintAmount1)).to.not.be.reverted
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount.sub(burnAmount));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(burnAmount);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(2)).to.equal(userTwoAddress);
            });

            it('Get correct variable if transferFrom erc20.',   async function () {
                await expect(brc404Factory.connect(owner).mintBRC404(
                    ticker, userAddress, mintAmount, btcTxId
                )).to.not.be.reverted

                let brc404Contract = BRC404__factory.connect(brc404Address, user);
                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount);
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(2);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                expect( await brc404Contract.ownerOf(2)).to.equal(userAddress);
                
                await expect(brc404Contract.approve(deployerAddress, mintAmount)).to.not.be.reverted

                brc404Contract = BRC404__factory.connect(brc404Address, deployer);
                await expect(brc404Contract.transferFrom(userAddress, userTwoAddress, mintAmount1)).to.not.be.reverted
                expect( await brc404Contract.allowance(userAddress, deployerAddress)).to.equal(mintAmount.sub(mintAmount1));

                expect( await brc404Contract.balanceOf(userAddress)).to.equal(mintAmount.sub(mintAmount1));
                expect( await brc404Contract.erc721BalanceOf(userAddress)).to.equal(1);
                expect( await brc404Contract.ownerOf(1)).to.equal(userAddress);
                
                expect( await brc404Contract.balanceOf(userTwoAddress)).to.equal(mintAmount1);
                expect( await brc404Contract.erc721BalanceOf(userTwoAddress)).to.equal(0);
            });
        })
    })
})