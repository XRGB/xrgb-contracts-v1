import '@nomiclabs/hardhat-ethers';
import { utils, Contract, BigNumber, logger } from 'ethers';
import {
  signWallet,
  eventsLib
} from '../__setup.spec';
import { expect } from 'chai';
import { HARDHAT_CHAINID } from './constants';
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers';
import { hexlify, keccak256, RLP, toUtf8Bytes} from 'ethers/lib/utils';
import hre from 'hardhat';

export function getChainId(): number {
  return hre.network.config.chainId || HARDHAT_CHAINID;
}

export function computeContractAddress(deployerAddress: string, nonce: number): string {
  const hexNonce = hexlify(nonce);
  return '0x' + keccak256(RLP.encode([deployerAddress, hexNonce])).substr(26);
}

export function matchEvent(
  receipt: TransactionReceipt,
  name: string,
  expectedArgs?: any[],
  eventContract: Contract = eventsLib,
  emitterAddress?: string
) {
  const events = receipt.logs;

  if (events != undefined) {
    // match name from list of events in eventContract, when found, compute the sigHash
    let sigHash: string | undefined;
    for (let contractEvent of Object.keys(eventContract.interface.events)) {
      if (contractEvent.startsWith(name) && contractEvent.charAt(name.length) == '(') {
        sigHash = keccak256(toUtf8Bytes(contractEvent));
        break;
      }
    }
    // Throw if the sigHash was not found
    if (!sigHash) {
      logger.throwError(
        `Event "${name}" not found in provided contract (default: Events libary). \nAre you sure you're using the right contract?`
      );
    }

    // Find the given event in the emitted logs
    let invalidParamsButExists = false;
    for (let emittedEvent of events) {
      // If we find one with the correct sighash, check if it is the one we're looking for
      if (emittedEvent.topics[0] == sigHash) {
        // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
        if (emitterAddress) {
          if (emittedEvent.address != emitterAddress) continue;
        }
        const event = eventContract.interface.parseLog(emittedEvent);
        // If there are expected arguments, validate them, otherwise, return here
        if (expectedArgs) {
          if (expectedArgs.length != event.args.length) {
            logger.throwError(
              `Event "${name}" emitted with correct signature, but expected args are of invalid length`
            );
          }
          invalidParamsButExists = false;
          // Iterate through arguments and check them, if there is a mismatch, continue with the loop
          for (let i = 0; i < expectedArgs.length; i++) {
            // Parse empty arrays as empty bytes
            if (expectedArgs[i].constructor == Array && expectedArgs[i].length == 0) {
              expectedArgs[i] = '0x';
            }

            // Break out of the expected args loop if there is a mismatch, this will continue the emitted event loop
            if (BigNumber.isBigNumber(event.args[i])) {
              if (!event.args[i].eq(BigNumber.from(expectedArgs[i]))) {
                invalidParamsButExists = true;
                break;
              }
            } else if (event.args[i].constructor == Array) {
              let params = event.args[i];
              let expected = expectedArgs[i];
              if (expected != '0x' && params.length != expected.length) {
                invalidParamsButExists = true;
                break;
              }
              for (let j = 0; j < params.length; j++) {
                if (BigNumber.isBigNumber(params[j])) {
                  if (!params[j].eq(BigNumber.from(expected[j]))) {
                    invalidParamsButExists = true;
                    break;
                  }
                } else if (params[j] != expected[j]) {
                  invalidParamsButExists = true;
                  break;
                }
              }
              if (invalidParamsButExists) break;
            } else if (event.args[i] != expectedArgs[i]) {
              invalidParamsButExists = true;
              break;
            }
          }
          // Return if the for loop did not cause a break, so a match has been found, otherwise proceed with the event loop
          if (!invalidParamsButExists) {
            return;
          }
        } else {
          return;
        }
      }
    }
    // Throw if the event args were not expected or the event was not found in the logs
    if (invalidParamsButExists) {
      logger.throwError(`Event "${name}" found in logs but with unexpected args`);
    } else {
      logger.throwError(
        `Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`
      );
    }
  } else {
    logger.throwError('No events were emitted');
  }
}

export function findEvent(
  receipt: TransactionReceipt,
  name: string,
  eventContract: Contract = eventsLib,
  emitterAddress?: string
) {
  const events = receipt.logs;

  if (events != undefined) {
    // match name from list of events in eventContract, when found, compute the sigHash
    let sigHash: string | undefined;
    for (const contractEvent of Object.keys(eventContract.interface.events)) {
      if (contractEvent.startsWith(name) && contractEvent.charAt(name.length) == '(') {
        sigHash = keccak256(toUtf8Bytes(contractEvent));
        break;
      }
    }
    // Throw if the sigHash was not found
    if (!sigHash) {
      logger.throwError(
        `Event "${name}" not found in provided contract (default: Events libary). \nAre you sure you're using the right contract?`
      );
    }

    for (const emittedEvent of events) {
      // If we find one with the correct sighash, check if it is the one we're looking for
      if (emittedEvent.topics[0] == sigHash) {
        // If an emitter address is passed, validate that this is indeed the correct emitter, if not, continue
        if (emitterAddress) {
          if (emittedEvent.address != emitterAddress) continue;
        }
        const event = eventContract.interface.parseLog(emittedEvent);
        return event;
      }
    }
    // Throw if the event args were not expected or the event was not found in the logs
    logger.throwError(
      `Event "${name}" not found emitted by "${emitterAddress}" in given transaction log`
    );
  } else {
    logger.throwError('No events were emitted');
  }
}

export async function waitForTx(
  tx: Promise<TransactionResponse> | TransactionResponse,
  skipCheck = false
): Promise<TransactionReceipt> {
  if (!skipCheck) await expect(tx).to.not.be.reverted;
  return await (await tx).wait();
}

let snapshotId: string = '0x1';
export async function takeSnapshot() {
  snapshotId = await hre.ethers.provider.send('evm_snapshot', []);
}

export async function revertToSnapshot() {
  await hre.ethers.provider.send('evm_revert', [snapshotId]);
}

export async function buildMintSeparator(
  contractAddr: string,
  name: string,
  token: string,
  to: string,
  amount: number,
  txid: string
): Promise<{ v: number; r: string; s: string }> {
  const msgParams = buildMintParams(contractAddr, name, token, to, amount, txid);
  return await getSig(msgParams);
}

const buildMintParams = (
  contractAddr: string,
  name: string,
  token: string,
  to: string,
  amount: number,
  txid: string
) => ({
  types: {
    Mint: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'txid', type: 'string' },
    ],
  },
  domain: {
    name: name,
    version: '1',
    chainId: getChainId(),
    verifyingContract: contractAddr,
  },
  value: {
    token: token,
    to: to,
    amount: amount,
    txid: txid,
  },
});

async function getSig(msgParams: {
  domain: any;
  types: any;
  value: any;
}): Promise<{ v: number; r: string; s: string }> {
  const sig = await signWallet._signTypedData(msgParams.domain, msgParams.types, msgParams.value);
  return utils.splitSignature(sig);
}
