
// Truffle does not expose chai so it is impossible to add chai-as-promised.
// This is a simple replacement function.
// https://github.com/trufflesuite/truffle/issues/2090
const assertIsRejected = (promise,error_match,message) =>
  {
    let passed = false
    return promise
      .then(() =>
        {
        passed = true
        return assert.fail()
        })
      .catch(error =>
        {
        if (passed)
          return assert.fail(message || 'Expected promise to be rejected')
        if (error_match)
          {
          if (typeof error_match === 'string')
            return assert.equal(error_match,error.message,message);
          if (error_match instanceof RegExp)
            return error.message.match(error_match) || assert.fail(error.message,error_match.toString(),`'${error.message}' does not match ${error_match.toString()}: ${message}`);
          return assert.instanceOf(error,error_match,message);
          }
        })
  }

  module.exports = {
    assertIsRejected
  }
  