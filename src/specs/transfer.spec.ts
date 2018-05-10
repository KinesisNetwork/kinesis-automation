import { expect } from 'chai'
import * as network from '../services/network'
describe('Transfer', function () {
  this.timeout(15000)

  it('Balances are updated correctly when creating a new account', async () => {
    const rootAccountBalance = await network.getAccountBalance(network.rootPublic)
    const transactionAmount = 100
    const payableFee = await network.currentFee(transactionAmount)

    const expectedEndRootAccountBalance = rootAccountBalance - transactionAmount - payableFee

    const newAccount = network.getNewKeypair()

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    const rootAccountBalanceAfterTransfer = await network.getAccountBalance(network.rootPublic)
    const newAccountBalance = await network.getAccountBalance(newAccount.publicKey())

    expect(rootAccountBalanceAfterTransfer).to.eql(expectedEndRootAccountBalance)
    expect(newAccountBalance).to.eql(transactionAmount)
  })

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

    expect(rootAccountBalanceAfterTransfer).to.eql(expectedEndRootBalance)
    expect(newAccountBalanceAfterTransfer).to.eql(expectedEndNewAccountBalance)
  })
})
