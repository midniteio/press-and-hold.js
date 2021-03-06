const ACTIONS = { create: 'create', remove: 'remove' };

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

class PressAndHold { // eslint-disable-line no-unused-vars
  constructor(configuration) {
    if (configuration.duration === undefined) {
      throw new Error('pressAndHold configuration error: A duration is required to instantiate');
    }
    if (configuration.keyCode === undefined && this.mouseButton === undefined) {
      throw new Error('pressAndHold configuration error: A keyCode or mousebutton is required to instantiate');
    }

    let defaults = {
      interval: 1,
      onStart: () => {},
      onSuccess: () => {},
      onCancel: () => {},
      onTick: () => {}
    };

    Object.assign(this, defaults, configuration);
    this.completed = false;
    this.timer = null;
    this.eventStart = this.eventStart.bind(this);
    this.eventEnd = this.eventEnd.bind(this);
    this.handleListeners(ACTIONS.create);
  }

  eventStart(e) {
    e = e || window.event;
    if (this.matchPredicate(e) && !this.timer && !this.completed) {
      this.onStart(e);
      let timeData = this.initTimer(this.duration);
      this.timer = setInterval(() => this.pollTimer(timeData), this.interval);
    }
  }

  eventEnd(e) {
    e = e || window.event;
    if (this.matchPredicate(e)) {
      this.resetTimer();
      if (!this.completed) {
        this.onCancel(e);
      }
      this.completed = false;
    }
  }

  initTimer(timeRequired) {
    let startTime = Date.now();
    return {
      startTime,
      timeRequired,
      endTime: startTime + timeRequired
    };
  }

  pollTimer(timeData) {
    let currentTime = Date.now();
    let elapsed = currentTime - timeData.startTime;
    let remaining = timeData.endTime - currentTime;
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

  resetTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  matchPredicate(e) {
    if (e.type.includes('key')) {
      return (e.which || e.keyCode) === this.keyCode;
    }
    if (e.type.includes('mouse')) {
      return e.button === this.mouseButton;
    }
  }

  handleListeners(action) {
    let actionHandler = (action === ACTIONS.create) ? document.addEventListener : document.removeEventListener;
    if (this.keyCode !== undefined) {
      actionHandler('keydown', this.eventStart);
      actionHandler('keyup', this.eventEnd);
    }
    if (this.mouseButton !== undefined) {
      actionHandler('mousedown', this.eventStart);
      actionHandler('mouseup', this.eventEnd);
    }
  }
};
