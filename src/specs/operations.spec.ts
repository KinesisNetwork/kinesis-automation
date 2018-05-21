import * as network from '../services/network'
describe('multiple operations', function () {
  this.timeout(20000)

  it.only('Balances are created successfully when a transaction is made to two accounts', async () => {
    const accountOne = network.getNewKeypair()
    const accountTwo = network.getNewKeypair()
    const transactionAmount = 100

    await network.transferFundsToMultipleAccount(
        network.rootPublic,
        network.rootSecret,
        accountOne.publicKey(),
        accountTwo.publicKey(),
        transactionAmount,
        true
    )

    const newAccountBalanceAfterTransfer = await network.getAccountBalance(accountTwo.publicKey())
    console.log(newAccountBalanceAfterTransfer)

    await network.transferFundsToMultipleAccount(
        network.rootPublic,
        network.rootSecret,
        accountOne.publicKey(),
        accountTwo.publicKey(),
        transactionAmount,
        false
    )

})
})
