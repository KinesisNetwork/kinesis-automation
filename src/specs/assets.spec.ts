import * as network from '../services/network'
describe('multiple operations', function () {
  this.timeout(100000)

  it('The balance of the custom asset has increased for the received by the amount specified in the tx', async () => {
    const rootAccount = network.getNewKeypair()
    const assetAccount = network.getNewKeypair()

    network.payWithAsset()
  })

  it('The fee on the payment operation of the custom asset was equal to the base fee, ie percentage fees arent applied', async () => {
    //
  })
})
