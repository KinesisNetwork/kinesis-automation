import { expect } from 'chai'
import * as network from '../services/network'
describe('multiple operations', function () {
  this.timeout(20000)

  it('Correct fees are applied when a create transaction is made with operations to two accounts', async () => {
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

  it('Correct fees are applied when a transfer transaction is made with operations to two accounts', async () => {
    const accountOne = network.getNewKeypair()
    const accountTwo = network.getNewKeypair()
    const transactionAmount = 100
    const baseFee = Number(await network.currentFeeMultiOp(transactionAmount * 4))

    const initialRootBalance = await network.getAccountBalance(network.rootPublic)

    await network.transferFundsToMultipleAccount(
        network.rootPublic,
        network.rootSecret,
        accountOne.publicKey(),
        accountTwo.publicKey(),
        transactionAmount,
        true
    )
    await network.transferFundsToMultipleAccount(
        network.rootPublic,
        network.rootSecret,
        accountOne.publicKey(),
        accountTwo.publicKey(),
        transactionAmount,
        false
    )

    const rootAccountBalanceAfterTransactions = await network.getAccountBalance(network.rootPublic)
    const expectedAccountBalanceAfterTransactions = initialRootBalance - baseFee - (transactionAmount * 4)

    expect(Math.round(rootAccountBalanceAfterTransactions)).to.eql(Math.round(expectedAccountBalanceAfterTransactions))
})
  it.only('Account is deleted and remaining balance transferred to destination account if account doesnt have enough funds', async () => {
      const rootAccount = network.rootPublic
      const rootAccountBalance = await network.getAccountBalance(rootAccount)
      const destinationAccount = network.getNewKeypair()
      const transferAmount = rootAccountBalance + 100

      console.log(transferAmount)
      if (transferAmount > rootAccountBalance) {
          network.mergeAccount
      } else {
        await network.transferFunds(
            network.rootPublic,
            network.rootSecret,
            destinationAccount.publicKey(),
            transferAmount,
            true
        )
    }
  })
})
