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

    debugger

    expect(rootAccountBalanceAfterTransfer).to.eql(expectedEndRootAccountBalance)
    expect(newAccountBalance).to.eql(transactionAmount)
  })
})
