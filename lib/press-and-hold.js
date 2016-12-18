'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ACTIONS = { create: 'create', remove: 'remove' };

/**
 * @PressAndHold
 * @param {Object} configuration                - The configuration to this instance of pressAndHold
 * @param {integer} configuration.duration      - The amount of time to hold for to trigger success in ms
 * @param {integer} configuration.interval [1]  - The interval which the time elapsed gets checked in ms
 * @param {integer} configuration.keycode       - The keycode to monitor (See: http://keycode.info/)
 * @param {integer} configuration.mouseButton   - The mouse button to monitor (Example: 0 = Left. 1 = Middle. 2 = Right)

 * @param {function} configuration.onStart      - Callback triggered when key/mouse hold begins.
 * - The mousedown/keydown event data is provided to the callback as an argument

 * @param {function} configuration.onTick       - Callback triggered for each tick of interval
 * - Time elapsed, remaining, and percentage complete are provided to the callback as arguments

 * @param {function} configuration.onSuccess    - Callback triggered when event ends successfully

 * @param {function} configuration.onCancel     - Callback triggered when event is cancelled before full duration
 * - The mouseup/keyup event data is provided to the callback as an argument
 */

var PressAndHold = function () {
  function PressAndHold(configuration) {
    _classCallCheck(this, PressAndHold);

    if (configuration.duration === undefined) {
      throw new Error('pressAndHold configuration error: A duration is required to instantiate');
    }
    if (configuration.keyCode === undefined && this.mouseButton === undefined) {
      throw new Error('pressAndHold configuration error: A keyCode or mousebutton is required to instantiate');
    }

    var defaults = {
      interval: 1,
      onStart: function onStart() {},
      onSuccess: function onSuccess() {},
      onCancel: function onCancel() {},
      onTick: function onTick() {}
    };

    Object.assign(this, defaults, configuration);
    this.completed = false;
    this.timer = null;
    this.eventStart = this.eventStart.bind(this);
    this.eventEnd = this.eventEnd.bind(this);
    this.handleListeners(ACTIONS.create);
  }

  _createClass(PressAndHold, [{
    key: 'eventStart',
    value: function eventStart(e) {
      var _this = this;

      e = e || window.event;
      if (this.matchPredicate(e) && !this.timer && !this.completed) {
        (function () {
          _this.onStart(e);
          var timeData = _this.initTimer(_this.duration);
          _this.timer = setInterval(function () {
            return _this.pollTimer(timeData);
          }, _this.interval);
        })();
      }
    }
  }, {
    key: 'eventEnd',
    value: function eventEnd(e) {
      e = e || window.event;
      if (this.matchPredicate(e)) {
        this.resetTimer();
        if (!this.completed) {
          this.onCancel(e);
        }
        this.completed = false;
      }
    }
  }, {
    key: 'initTimer',
    value: function initTimer(timeRequired) {
      var startTime = Date.now();
      return {
        startTime: startTime,
        timeRequired: timeRequired,
        endTime: startTime + timeRequired
      };
    }
  }, {
    key: 'pollTimer',
    value: function pollTimer(timeData) {
      var currentTime = Date.now();
      var elapsed = currentTime - timeData.startTime;
      var remaining = timeData.endTime - currentTime;
      if (currentTime >= timeData.endTime) {
        this.resetTimer();
        this.completed = true;
        this.onSuccess();

        if (!this.keepAlive) {
          this.handleListeners(ACTIONS.remove);
        }
      } else {
        this.onTick(elapsed, remaining, elapsed / timeData.timeRequired);
      }
    }
  }, {
    key: 'resetTimer',
    value: function resetTimer() {
      clearInterval(this.timer);
      this.timer = null;
    }
  }, {
    key: 'matchPredicate',
    value: function matchPredicate(e) {
      if (e.type.includes('key')) {
        return (e.which || e.keyCode) === this.keyCode;
      }
      if (e.type.includes('mouse')) {
        return e.button === this.mouseButton;
      }
    }
  }, {
    key: 'handleListeners',
    value: function handleListeners(action) {
      var actionHandler = action === ACTIONS.create ? document.addEventListener : document.removeEventListener;
      if (this.keyCode !== undefined) {
        actionHandler('keydown', this.eventStart);
        actionHandler('keyup', this.eventEnd);
      }
      if (this.mouseButton !== undefined) {
        actionHandler('mousedown', this.eventStart);
        actionHandler('mouseup', this.eventEnd);
      }
    }
  }]);

  return PressAndHold;
}();

;
