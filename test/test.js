const { assert } = require('chai')

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, creator, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images ', async () => {
    let result, imageCounter
    const hash = 'abc123'

    before(async () => {
      result = await decentragram.uploadImage(hash, 'Description', { from: creator })
      imageCounter = await decentragram.imageCounter()
    })

    it('creates images', async () => {
      // POSITIVE TESTING
      assert.equal(imageCounter, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCounter.toNumber(), 'ID is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Description', 'Description is correct')
      assert.equal(event.amount, 0, 'Amount is correct')
      assert.equal(event.creator, creator, 'Creator is correct')

      // NEGATIVE TESTING
      await decentragram.uploadImage('', 'Description', { from: creator }).should.be.rejected;

      await decentragram.uploadImage('Hash', '', { from: creator }).should.be.rejected;

    })

    it('lists images', async () => {
      const image = await decentragram.images(imageCounter)
      assert.equal(image.id.toNumber(), imageCounter.toNumber(), 'ID is correct')
      assert.equal(image.hash, hash, 'Hash is correct')
      assert.equal(image.description, 'Description', 'Description is correct')
      assert.equal(image.amount, 0, 'Amount is correct')
      assert.equal(image.creator, creator, 'Creator is correct')
    })

    it('tips images', async () => {
      // POSITIVE TESTING
      // Track the creator balance
      let oldBalance
      oldBalance = await web3.eth.getBalance(creator)
      oldBalance = new web3.utils.BN(oldBalance)

      result = await decentragram.tipImageOwner(imageCounter, { from: tipper, value: web3.utils.toWei('1', 'Ether') })
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCounter.toNumber(), 'ID is correct')
      assert.equal(event.hash, hash, 'Hash is correct')
      assert.equal(event.description, 'Description', 'Description is correct')
      assert.equal(event.amount, 1000000000000000000, 'Amount is correct')
      assert.equal(event.creator, creator, 'Creator is correct')

      // Check if the creator received funds
      let newBalance
      newBalance = await web3.eth.getBalance(creator)
      newBalance = new web3.utils.BN(newBalance)

      let tipImageOwner
      tipImageOwner = await web3.utils.toWei('1', 'Ether')
      tipImageOwner = new web3.utils.BN(tipImageOwner)

      const expectedBalance = oldBalance.add(tipImageOwner)

      assert.equal(newBalance.toString(), expectedBalance.toString())

      // NEGATIVE TESTING
      await decentragram.tipImageOwner(0, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      await decentragram.tipImageOwner(100, { from: tipper, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })
  })
})