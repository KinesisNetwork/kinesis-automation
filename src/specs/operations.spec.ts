import { expect } from 'chai'
import { round } from 'lodash'
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

    const rootAccountBalanceAfterTransactions = round(await network.getAccountBalance(network.rootPublic), 4)
    const expectedAccountBalanceAfterTransactions = round(initialRootBalance - baseFee - (transactionAmount * accounts.length), 4)

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

    const rootAccountBalanceAfterTransactions = round(await network.getAccountBalance(network.rootPublic), 4)
    const expectedAccountBalanceAfterTransactions = round(initialRootBalance - baseFeeTransfer - (transactionAmount * accounts.length * 2), 4)

    expect(rootAccountBalanceAfterTransactions).to.eql(expectedAccountBalanceAfterTransactions)
  })

  it('Account is deleted and remaining balance transferred to destination account if account doesnt have enough funds', async () => {
    const lowBalanceAccount = network.getNewKeypair()
    const destinationAccount = network.getNewKeypair()
    const transferAmount = 50
    const baseFee = await network.currentBaseFeeString()
    const baseFeeTransfer = await network.currentFee(transferAmount)

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      lowBalanceAccount.publicKey(),
      transferAmount,
      true
    )
    const lowAccountBal = await network.getAccountBalance(lowBalanceAccount.publicKey())

    await network.transferFunds(
      network.rootPublic,
      [network.rootSecret],
      destinationAccount.publicKey(),
      transferAmount,
      true
    )
    const destinationAccountBal = await network.getAccountBalance(destinationAccount.publicKey())

    try {
      await network.transferFunds(
        lowBalanceAccount.publicKey(),
        [lowBalanceAccount.secret()],
        destinationAccount.publicKey(),
        transferAmount,
        false
      )
      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.operations[0]).to.eql('op_underfunded')
    }

    await network.mergeAccount(lowBalanceAccount.publicKey(), lowBalanceAccount.secret(), destinationAccount.publicKey(), baseFee)

    const balAfterMerge = await network.getAccountBalance(destinationAccount.publicKey())
    const roundedBalAfterMerge = round(balAfterMerge, 4)

    const expectedBalAfterMerge = round(destinationAccountBal + lowAccountBal - baseFeeTransfer, 4)

    expect(roundedBalAfterMerge).to.eql(expectedBalAfterMerge)

    try {
      console.log(await network.getAccountBalance(lowBalanceAccount.publicKey()))
    } catch (e) {
      expect(e.message.status).to.eql(404)
    }
  })
})
