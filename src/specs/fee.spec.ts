import { expect } from 'chai'
import * as network from '../services/network'
describe('Fees', function () {
  this.timeout(50000)

  it('The network rejects "create_account" operations if the fee is too low', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 50

    const requiredFee = await network.currentFeeInStroops(transactionAmount)
    const lowFee = requiredFee - 10

    try {
      await network.transferFunds(
        network.rootPublic,
        network.rootSecret,
        newAccount.publicKey(),
        transactionAmount,
        true,
        lowFee
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.transaction).to.eql('tx_insufficient_fee')
    }
  })

  it('The network rejects "transfer" operations if the fee is too low', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 50

    const requiredFee = await network.currentFeeInStroops(transactionAmount)
    const lowFee = requiredFee - 10

    try {
      await network.transferFunds(
        network.rootPublic,
        network.rootSecret,
        newAccount.publicKey(),
        transactionAmount,
        true,
      )
      await network.transferFunds(
        newAccount.publicKey(),
        newAccount.secret(),
        newAccount.publicKey(),
        transactionAmount,
        false,
        lowFee
      )

      throw new Error('Wrong Error')
    } catch (e) {
      expect(e.data.extras.result_codes.transaction).to.eql('tx_insufficient_fee')
    }
  })

  it('The network accepts higher fees than are required for "create_account"', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 50

    const requiredFee = await network.currentFeeInStroops(transactionAmount)
    const highFee = requiredFee + 10

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true,
      highFee
    )
  })

  it('The network accepts higher fees than are required for "transfer"', async () => {
    const newAccount = network.getNewKeypair()
    const transactionAmount = 50

    const requiredFee = await network.currentFeeInStroops(transactionAmount)
    const highFee = requiredFee + 10

    await network.transferFunds(
      network.rootPublic,
      network.rootSecret,
      newAccount.publicKey(),
      transactionAmount,
      true,
    )
    await network.transferFunds(
      newAccount.publicKey(),
      newAccount.secret(),
      newAccount.publicKey(),
      transactionAmount,
      false,
      highFee
    )
  })

  it('Only the base fee is required for operations that are not of type "transfer" or "create_account"', async () => {
    const targetAccount = network.rootPublic
    const baseFee = await network.currentBaseFeeString()
    await network.processInflation(targetAccount, network.rootSecret, baseFee)
  })
})
