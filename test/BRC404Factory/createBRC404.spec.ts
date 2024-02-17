import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    owner,
    brc404Factory,
} from '../__setup.spec';

makeSuiteCleanRoom('create BRC404', function () {
    context('Generic', function () {

        context('Negatives', function () {
            it('User should fail to create BRC404 if not owner.',   async function () {
                await expect(brc404Factory.connect(user).createBRC404("MoMo", "Momo", 18, 10000, 1)).to.be.reverted
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if create BRC404 success.',   async function () {
                await expect(brc404Factory.connect(owner).createBRC404("MoMo", "Momo", 18, 10000, 1)).to.not.be.reverted;
                await expect(brc404Factory.connect(owner).createBRC404("MoMo", "Momo", 18, 1000, 1)).to.be.reverted;
            });
        })
    })
})