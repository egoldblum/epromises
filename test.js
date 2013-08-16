const Promise = require('./promise');
const testDriver = require('promises-aplus-tests');

function fulfilled(value) {
  return new Promise({
    value: value,
    state: 'fulfilled'
  });
}

function rejected(reason) {
  return new Promise({
    reason: reason,
    state: 'rejected'
  });
}

function pending() {
  var p = new Promise();
  return {
    promise: p,
    fulfill: p.fulfill,
    reject: p.reject
  };
}

const adapter = {
  fulfilled: fulfilled,
  rejected: rejected,
  pending: pending
};

testDriver(adapter, {reporter: 'spec'}, function (err) {
  console.log(err);
});
