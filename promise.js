module.exports = function Promise(config) {
  config = config || {};
  var _state, _value, _reason;
  var _children = [];
  switch (config.state) {
  case 'fulfilled':
    _state = 'fulfilled';
    _value = config.value;
    break;
  case 'rejected':
    _state = 'rejected';
    _reason = config.reason;
    break;
  case 'pending':
    /* falls through */
  default:
    _state = 'pending';
  }

  return {
    fulfill: function fulfill(value) {
      if (_state !== 'fulfilled') {
        _state = 'fulfilled';
        _value = value;
      }

      _children.forEach(function (child) {
        if (child.calledFulfilled || child.calledRejected) {
          return;
        }

        if (typeof child.onFulfilled !== 'function') {
          // 3.2.6.4
          child.promise.fulfill(_value);
          return;
        }

        try {
          //3.2.2
          child.calledFulfilled = true;
          var fulfillVal = child.onFulfilled(_value);
          if (fulfillVal && typeof fulfillVal.then === 'function') {
            //3.2.6.3
            fulfillVal.then(function (v) {
              child.promise.fulfill(v);
            }, function (r) {
              child.promise.reject(r);
            });
          } else {
            //3.2.6.1
            child.promise.fulfill(fulfillVal);
          }
        } catch (e) {
          //3.2.6.2
          child.promise.reject(e);
        }
      });
    },

    reject: function reject(reason) {
      if (_state !== 'rejected') {
        _state = 'rejected';
        _reason = reason;
      }

      _children.forEach(function (child) {
        if (child.calledFulfilled || child.calledRejected) {
          return;
        }

        // 3.2.6.5
        if (typeof child.onRejected !== 'function') {
          child.promise.reject(_reason);
          return;
        }

        try {
          //3.2.3
          child.calledRejected = true;
          var rejectVal = child.onRejected(_reason);
          if (rejectVal && typeof rejectVal.then === 'function') {
            //3.2.6.3
            rejectVal.then(function (v) {
              child.promise.fulfill(v);
            }, function (r) {
              child.promise.reject(r);
            });
          } else {
            //3.2.6.1
            child.promise.fulfill(rejectVal);
          }
        } catch (e) {
          //3.2.6.2
          child.promise.reject(e);
        }
      });
    },

    then: function then(onFulfilled, onRejected) {
      var p = new Promise({
        state: 'pending'
      });

      var child = {
        promise: p,
        onFulfilled: onFulfilled,
        onRejected: onRejected,
        calledFulfilled: false,
        calledRejected: false,
      };

      _children.push(child);

      if (_state === 'rejected') {
        setTimeout(this.reject, 0);
      }
      if (_state === 'fulfilled') {
        setTimeout(this.fulfill, 0);
      }

      return p;
    }
  };
};
