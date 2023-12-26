import '@nomiclabs/hardhat-ethers';
import { expect } from 'chai';
import {
    makeSuiteCleanRoom,
    user,
    deployer,
    brc20Factory,
} from '../__setup.spec';

makeSuiteCleanRoom('create BRC20', function () {
    context('Generic', function () {

        context('Negatives', function () {
            it('User should fail to create BRC20 if not owner.',   async function () {
                await expect(brc20Factory.connect(user).createBRC20("MoMo", "Momo", 18, 1000)).to.be.revertedWith("Ownable: caller is not the owner")
            });
        })

        context('Scenarios', function () {
            it('Get correct variable if create BRC2 success.',   async function () {
                await expect(brc20Factory.connect(deployer).createBRC20("MoMo", "Momo", 18, 1000)).to.not.be.reverted;
                await expect(brc20Factory.connect(deployer).createBRC20("MoMo", "Momo", 18, 1000)).to.be.reverted;
            });
        })
    })
})