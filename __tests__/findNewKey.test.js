const faker = require('faker');
const findNewKey = require('../src/util/findNewKey');

describe('findNewKey', () => {
  const pivotField = 'city';
  const keys = ['name', 'lastName', pivotField];

  it('Should find the same values as the original keys', () => {
    const result = keys.reduce((lineResult, key) => {
      const newKey = findNewKey({ key, linearData: false });
      lineResult.push(newKey);
      return lineResult;
    }, []);

    expect(result[0]).toBe(keys[0]);
  });

  it('Should find key indexes', () => {
    const result = keys.reduce((lineResult, key) => {
      const countNewItems = lineResult.length;
      const newKey = findNewKey({ countNewItems, key, linearData: true });
      lineResult.push(newKey);
      return lineResult;
    }, []);

    expect(result[0]).toBe('0');
  });

  it('Should concatenate key indexes with a prefix', () => {
    const keyPrefix = 'Cd_';
    const countCurrentItems = 2;
    const result = keys.reduce((lineResult, key) => {
      const countNewItems = lineResult.length;
      const newKey = findNewKey({
        countCurrentItems,
        countNewItems,
        key,
        keyPrefix,
        linearData: true,
      });

      lineResult.push(newKey);
      return lineResult;
    }, []);

    expect(result[0]).toBe(`${keyPrefix}${countCurrentItems}`);
  });

  it('Should find values for columnMap indexes', () => {
    const city = faker.address.city();
    const columnMap = {
      [`${city}_${keys[0]}`]: 0,
      [`${city}_${keys[1]}`]: 1,
    };

    const result = keys.reduce((lineResult, key) => {
      if (pivotField === key) {
        return lineResult;
      }

      const newKey = findNewKey({ columnMap, key, pivotFieldValue: city });
      lineResult.push(newKey);
      return lineResult;
    }, []);

    expect(result[0]).toBe(columnMap[`${city}_${keys[0]}`]);
  });
});
