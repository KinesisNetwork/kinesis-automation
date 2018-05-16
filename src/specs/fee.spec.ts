 import { expect } from 'chai'
 import * as network from '../services/network'
 describe('Fees', function () {
  this.timeout(50000)

  it('A percentage fee rate is required for "create_account" operations', async () => {
    const newAccount = network.getNewKeypair()
    const targetAccount = network.getNewKeypair()
    const transactionAmount = 50

    await network.transferFundsLowFee(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    try {
      await network.transferFundsLowFee(
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

  it('A percentage fee rate is required for "transfer" operations', async () => {
    const newAccount = network.getNewKeypair()
    const targetAccount = network.getNewKeypair()
    const transactionAmount = 50

    await network.transferFundsLowFee(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true
    )

    try {
      await network.transferFundsLowFee(
        newAccount.publicKey(),
        newAccount.secret(),
        targetAccount.publicKey(),
        transactionAmount,
        true
      )

      await network.transferFundsLowFee(
        newAccount.publicKey(),
        newAccount.secret(),
        targetAccount.publicKey(),
        transactionAmount,
        false
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.operations[0]).to.eql('op_underfunded')
    }
    })

  it('The network accepts higher fees than are required', async () => {
    const targetAccount = network.getNewKeypair()
    const transactionAmount = 50

    await network.transferFundsHighFee(
      network.rootPublic,
      network.rootSecret,
      targetAccount.publicKey(),
      transactionAmount,
      true
    )

    const targetAccountBalance = await network.getAccountBalance(targetAccount.publicKey())
    expect(targetAccountBalance).to.eql(transactionAmount)
  })

  it('Only the base fee is required for operations that are not of type "transfer" or "create_account"', async () => {
    console.log('TODO')
  })

  it('The network rejects "create_account" operations if the fee is too low', async () => {
    console.log('TODO')
  })

  it('The network rejects "transfer" operations if the fee is too low', async () => {
    console.log('TODO')
  })
})
