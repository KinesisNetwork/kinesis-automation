import { expect } from 'chai'
import * as network from '../services/network'
import { round } from 'lodash'

describe('Create Account', function () {
  this.timeout(20000)

  it('Balances are updated correctly when creating a new account', async () => {
    const rootAccountBalance = await network.getAccountBalance(network.rootPublic)
    const transactionAmount = 100
    const payableFee = await network.currentFee(transactionAmount)

    const expectedEndRootAccountBalance = round(rootAccountBalance - transactionAmount - payableFee, 4)

    const newAccount = network.getNewKeypair()

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    const rootAccountBalanceAfterTransfer = round(await network.getAccountBalance(network.rootPublic), 4)
    const newAccountBalance = await network.getAccountBalance(newAccount.publicKey())

    expect(rootAccountBalanceAfterTransfer).to.eql(expectedEndRootAccountBalance)
    expect(newAccountBalance).to.eql(transactionAmount)
  })

  it('"create_account" fails if the source account is not yet activated', async () => {
    const emptyAccount = network.getNewKeypair()
    const targetAccount = network.getNewKeypair()
    const transactionAmount = 100

    try {
      await network.transferFunds(
        emptyAccount.publicKey(),
        [emptyAccount.secret()],
        targetAccount.publicKey(),
        transactionAmount,
        true
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.message.status).to.eql(404)
    }
  })

  it('verify "create_account" operation amounts', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 100
    const payableFee = await network.currentFee(transactionAmount)

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    const tx = (await network.getMostRecentTransactions())[0]

    expect(tx.fee_paid).to.eql(payableFee * 10000000)
    expect(tx.operations.length).to.eql(1)

    const targetOp = tx.operations[0]
    expect(targetOp.starting_balance).to.eql(transactionAmount.toFixed(7))
  })
})
