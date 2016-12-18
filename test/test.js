import chai from 'chai';
import PressAndHold from '../src/index';

chai.should();

describe('pressAndHold constructor/initialization error handling', function() {
  it('should throw an error if duration is not provided', function() {
    (() => {
      return new PressAndHold({
        keyCode: 37
      });
    }).should.throw(Error);
  });

  it('should throw an error if no key or mousebutton is not provided', function() {
    (() => {
      return new PressAndHold({
        duration: 1000
      });
    }).should.throw(Error);
  });
});
