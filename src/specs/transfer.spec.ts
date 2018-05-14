import { expect } from 'chai'
import * as network from '../services/network'
import { round } from 'lodash'

describe('Transfer', function () {
  this.timeout(20000)

  it('Balances are updated correctly when transferring to an existing account', async () => {
    const transactionAmount = 100
    const newAccount = network.getNewKeypair()
    const payableFee = await network.currentFee(transactionAmount)

    // Activate account
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
    const rootAccountBalanceAfterTransfer = await network.getAccountBalance(network.rootPublic)
    const newAccountBalanceAfterTransfer = await network.getAccountBalance(newAccount.publicKey())

    const expectedEndRootBalance = rootAccountBalance - transactionAmount - payableFee
    const expectedEndNewAccountBalance = newAccountBalance + transactionAmount

    expect(round(rootAccountBalanceAfterTransfer, 2)).to.eql(round(expectedEndRootBalance, 2))
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

  it.only('verify "transfer" operation amount', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 100
    const payableFee = await network.currentFee(transactionAmount)

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    await network.transferFunds(
      newAccount.publicKey(),
      newAccount.secret(),
      newAccount.publicKey(),
      transactionAmount,
      false
    )

    const tx = await network.getMostRecentTransaction()

    expect(tx.fee_paid).to.eql(payableFee * 10000000)
    expect(tx.operations.length).to.eql(1)
    const targetOp = tx.operations[0]
    expect(targetOp.starting_balance).to.eql(transactionAmount.toFixed(7))
  })
})
