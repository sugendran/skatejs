import helperElement from '../../lib/element';
import helpers from '../../lib/helpers';
import skate from '../../../src/index';

describe('lifecycle/properties', function () {
  var elem;

  beforeEach(function () {
    elem = helperElement();
  });

  it('no arguments', function () {
    skate(elem.safe, {
      properties: {
        propName1: undefined
      }
    });

    var el = elem.create();
    el.propName1 = 'testing';
    expect(el.propName1).to.equal('testing', 'Value should just be passed through');
    expect(el.getAttribute('prop-name1')).to.equal(null, 'Attribute linking should be off by default');
  });

  it('type', function () {
    skate(elem.safe, {
      properties: {
        propName1: Boolean,
        propName2: {
          type: Boolean
        }
      }
    });

    var el = elem.create();
    el.propName1 = '';
    el.propName2 = 'something';
    expect(el.propName1).to.equal(false, 'Type function can be specified instead of object');
    expect(el.propName2).to.equal(true, 'Object with only type definition can be specified');
  });

  it('attribute', function () {
    skate(elem.safe, {
      properties: {
        propName1: {
          attr: true
        },
        propName2: {
          attr: 'my-attr'
        }
      }
    });

    var el = elem.create();
    el.propName1 = 'testing1';
    el.propName2 = 'testing2';
    expect(el.getAttribute('prop-name1')).to.equal('testing1', 'Boolean true will use the property name in dash-case form');
    expect(el.getAttribute('my-attr')).to.equal('testing2', 'A string is used as the attribute name exactly');
  });

  it('Boolean + attribute', function () {
    skate(elem.safe, {
      properties: {
        propName1: {
          attr: true,
          type: Boolean
        }
      }
    });

    var el = elem.create();

    el.propName1 = 'something';
    expect(el.propName1).to.equal(true, 'Value should just be converted to boolean true');
    expect(el.getAttribute('prop-name1')).to.equal('', 'Attribute should be added but no value should be set');

    el.propName1 = '';
    expect(el.propName1).to.equal(false, 'Value should be converted to boolean false');
    expect(el.getAttribute('prop-name1')).to.equal(null, 'Attribute should be removed if value is false');
  });

  it('events', function () {
    var triggered;

    skate(elem.safe, {
      properties: {
        propName1: {
          notify: 'propName1-changed'
        }
      }
    });

    var el = elem.create();
    el.addEventListener('propName1-changed', e => triggered = e.detail.newValue);
    el.propName1 = true;
    expect(triggered).to.equal(true);
  });

  it('dependencies', function () {
    var triggered;

    skate(elem.safe, {
      properties: {
        propName1: {
          notify: 'propName1-changed'
        },
        propName2: {
          deps: 'propName1-changed',
          notify: 'propName2-changed'
        }
      }
    });

    var el = elem.create();

    el.addEventListener('propName2-changed', e => triggered = e.detail.newValue);
    el.propName1 = true;
    expect(triggered).to.equal(true);
  });

  it('dependencies (deep)', function () {
    var triggered;
    var elem2 = helperElement();

    skate(elem.safe, {
      properties: {
        propName1: {
          deps: 'el.deep',
          notify: 'el'
        }
      }
    });

    skate(elem2.safe, {
      properties: {
        propName1: {
          notify: 'el.deep'
        }
      }
    });

    var el1 = elem.create();
    var el2 = elem2.create();

    el1.appendChild(el2);
    helpers.fixture().appendChild(el1);
    el1.addEventListener('el', e => triggered = e.detail.newValue);
    el2.propName1 = true;
    expect(triggered).to.equal(true);
  });

  it('attribute triggers property change', function () {
    var triggered;

    skate(elem.safe, {
      properties: {
        propName1: {
          attr: true,
          notify: 'skate-property',
          type: Boolean
        }
      }
    });

    var el = elem.create();
    el.addEventListener('skate-property', e => triggered = e.detail.newValue);
    el.setAttribute('prop-name1', '');
    expect(triggered).to.equal(true);
  });

  it('default value (scalar)', function () {
    skate(elem.safe, {
      properties: {
        propName1: {
          value: 'test'
        }
      }
    });

    var el = elem.create();
    expect(el.propName1).to.equal('test');
  });

  it('default value (function)', function () {
    skate(elem.safe, {
      properties: {
        propName1: {
          value: function () {
            return 'test';
          }
        }
      }
    });

    var el = elem.create();
    expect(el.propName1).to.equal('test');
  });
});
