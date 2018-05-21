import { expect } from 'chai'
import * as network from '../services/network'
describe('multiple operations', function () {
  this.timeout(20000)

  it.only('Correct fees are applied when a transaction is made with operations to two accounts', async () => {
    const accountOne = network.getNewKeypair()
    const accountTwo = network.getNewKeypair()
    const transactionAmount = 100
    const baseFee = Number(await network.currentFeeMultiOp(transactionAmount * 2))

    const initialRootBalance = await network.getAccountBalance(network.rootPublic)

    await network.transferFundsToMultipleAccount(
        network.rootPublic,
        network.rootSecret,
        accountOne.publicKey(),
        accountTwo.publicKey(),
        transactionAmount,
        true
    )

    const rootAccountBalanceAfterTransactions = await network.getAccountBalance(network.rootPublic)
    const expectedAccountBalanceAfterTransactions = initialRootBalance - baseFee - (transactionAmount * 2)

    expect(rootAccountBalanceAfterTransactions).to.eql(expectedAccountBalanceAfterTransactions)
})
})
