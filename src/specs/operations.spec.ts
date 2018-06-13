import { expect } from 'chai'
import * as network from '../services/network'
describe('multiple operations', function () {
  this.timeout(60000)

  it('Correct fees are applied when a create transaction is made with operations to multiple accounts', async () => {
    const accounts = [network.getNewKeypair().publicKey(), network.getNewKeypair().publicKey(), network.getNewKeypair().publicKey()]
    const transactionAmount = 100
    const baseFee = Number(await network.currentFeeMultiOp(transactionAmount, accounts))

    const initialRootBalance = await network.getAccountBalance(network.rootPublic)

    await network.transferFundsToMultipleAccount(
      network.rootPublic,
      network.rootSecret,
      accounts,
      transactionAmount,
      true
    )

    const rootAccountBalanceAfterTransactions = await network.getAccountBalance(network.rootPublic)
    const expectedAccountBalanceAfterTransactions = initialRootBalance - baseFee - (transactionAmount * 2)

    expect(rootAccountBalanceAfterTransactions).to.eql(expectedAccountBalanceAfterTransactions)
  })

  it('Correct fees are applied when a transfer transaction is made with operations to multiple accounts', async () => {
    const accounts = [network.getNewKeypair().publicKey(), network.getNewKeypair().publicKey(), network.getNewKeypair().publicKey()]
    const transactionAmount = 100
    const baseFee = Number(await network.currentFeeMultiOp(transactionAmount, accounts))
    const baseFeeTransfer = baseFee * 2

    const initialRootBalance = await network.getAccountBalance(network.rootPublic)

    await network.transferFundsToMultipleAccount(
      network.rootPublic,
      network.rootSecret,
      accounts,
      transactionAmount,
      true
    )

    await network.transferFundsToMultipleAccount(
      network.rootPublic,
      network.rootSecret,
      accounts,
      transactionAmount,
      false
    )

    const rootAccountBalanceAfterTransactions = await network.getAccountBalance(network.rootPublic)
    const expectedAccountBalanceAfterTransactions = initialRootBalance - baseFeeTransfer - (transactionAmount * accounts.length * 2)

    expect(rootAccountBalanceAfterTransactions).to.eql(expectedAccountBalanceAfterTransactions)
  })

  it.only('Account is deleted and remaining balance transferred to destination account if account doesnt have enough funds', async () => {
    const lowBalanceAccount = network.getNewKeypair()
    const destinationAccount = network.getNewKeypair()
    const transferAmount = 50
    const baseFee = await network.currentBaseFeeString()

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      lowBalanceAccount.publicKey(),
      transferAmount,
      true
    )

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      destinationAccount.publicKey(),
      transferAmount,
      true
    )
    console.log(network.getAccountBalance(destinationAccount.publicKey()))

    try {
      await network.transferFunds(
        lowBalanceAccount.publicKey(),
        lowBalanceAccount.secret(),
        destinationAccount.publicKey(),
        transferAmount,
        false
      )
      throw new Error('Wrong Error')
     } catch (e) {
       expect(e.data.extras.result_codes.operations[0]).to.eql('op_underfunded')
     }

    await network.mergeAccount(lowBalanceAccount.publicKey(), lowBalanceAccount.secret(), destinationAccount.publicKey(), baseFee)
    // const DestinationAccountBal = network.getAccountBalance(destinationAccount.publicKey())
    // expect(DestinationAccountBal).to.eql(transferAmount)

    // try {
    //  console.log(await network.getAccountBalance(lowBalanceAccount.publicKey()))
    // } catch (e) {
    //  expect(e.message.status).to.eql(404)
    // }
  })
})
