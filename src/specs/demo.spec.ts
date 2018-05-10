import { expect } from 'chai'

describe('this is a test', () => {
  it('should pass', () => {
    expect(1).to.eql(1)
  })
  it('should fail', () => {
    expect(1).to.eql(2)
  })
})
