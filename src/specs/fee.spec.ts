// import { expect } from 'chai'
// import * as network from '../services/network'
describe('Fees', function () {
  this.timeout(20000)

  it('A percentage fee rate is required for "create_account" operations', async () => {
    console.log('TODO')
  })

  it('A percentage fee rate is required for "transfer" operations', async () => {
    console.log('TODO')
  })

  it('Only the base fee is required for operations that are not of type "transfer" or "create_account"', async () => {
    console.log('TODO')
  })

  it('The network accepts higher fees than are required', async () => {
    console.log('TODO')
  })

  it('The network rejects "create_account" operations if the fee is too low', async () => {
    console.log('TODO')
  })

  it('The network rejects "transfer" operations if the fee is too low', async () => {
    console.log('TODO')
  })
})
