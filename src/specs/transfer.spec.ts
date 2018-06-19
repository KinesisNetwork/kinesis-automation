import { expect } from 'chai'
import * as network from '../services/network'
import { sleep } from '../services/helpers'
import { round } from 'lodash'
import { CreateAccountOperationRecord } from 'js-kinesis-sdk'

describe('Transfer', function () {
  this.timeout(30000)

  it('Balances are updated correctly when transferring to an existing account', async () => {
    const transactionAmount = 100
    const newAccount = network.getNewKeypair()
    const payableFee = await network.currentFee(transactionAmount)

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    const rootAccountBalance = await network.getAccountBalance(network.rootPublic)
    const newAccountBalance = await network.getAccountBalance(newAccount.publicKey())

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      false
    )

    const rootAccountBalanceAfterTransfer = round(await network.getAccountBalance(network.rootPublic), 4)

    const newAccountBalanceAfterTransfer = await network.getAccountBalance(newAccount.publicKey())
    const expectedEndRootBalance = round((rootAccountBalance - transactionAmount - payableFee), 4)
    const expectedEndNewAccountBalance = newAccountBalance + transactionAmount

    expect(rootAccountBalanceAfterTransfer).to.eql(expectedEndRootBalance)
    expect(newAccountBalanceAfterTransfer).to.eql(expectedEndNewAccountBalance)
  })

  it('Transfer fails if the account has too little funds', async () => {
    const newAccount = network.getNewKeypair()
    const targetAccount = network.getNewKeypair()
    const transactionAmount = 50

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    try {
      await network.transferFunds(
        newAccount.publicKey(),
        newAccount.secret(),
        targetAccount.publicKey(),
        transactionAmount,
        true
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.operations[0]).to.eql('op_underfunded')
    }
  })

  it('verify "transfer" operation amount', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 100

    const tx = await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    // SDK / Horizon Bug. Sporadically fails without this wait,
    await sleep(1000)

    const { records: operations } = await tx.operations()
    const targetOp = operations[0] as CreateAccountOperationRecord

    expect(targetOp.starting_balance).to.eql(transactionAmount.toFixed(7))
  })
})
