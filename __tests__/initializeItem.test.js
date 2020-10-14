const faker = require('faker');
const initializeItem = require('../src/util/initializeItem');

describe('initializeItem', () => {
  // Data structure example { productName, color, price }
  const productName = faker.commerce.productName();
  const groupFieldValue = [productName];
  const keyPrefix = 'Cd_';

  it('Should return an array with an item', () => {
    const result = initializeItem({
      baseItem: [],
      groupFieldValue,
      hasPivotField: false,
      linearData: true,
    });

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it('Should return an object with an item of the same value as productName', () => {
    const result = initializeItem({
      baseItem: {},
      groupFieldValue,
      hasPivotField: false,
      keyPrefix,
      linearData: true,
    });

    expect(result).toBeInstanceOf(Object);
    expect(result[`${keyPrefix}0`]).toBe(productName);
  });

  it('Should return an empty array', () => {
    const result = initializeItem({
      baseItem: [],
      hasPivotField: false,
      linearData: false,
    });

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it('Should return an empty object', () => {
    const result = initializeItem({
      baseItem: {},
      hasPivotField: true,
      linearData: false,
    });

    expect(result).toBeInstanceOf(Object);
  });

  it('Should return an object with the first item equal to productName and the last null', () => {
    const baseItem = {
      [`${keyPrefix}0`]: null,
      [`${keyPrefix}1`]: null,
      [`${keyPrefix}2`]: null,
    };

    const result = initializeItem({
      baseItem,
      groupFieldValue,
      hasPivotField: true,
      keyPrefix,
      linearData: true,
    });

    expect(result).toBeInstanceOf(Object);
    expect(result[`${keyPrefix}0`]).toBe(productName);
    expect(result[`${keyPrefix}2`]).toBe(null);
  });

  it('Should return an array with three items', () => {
    const baseItem = [null, null, null];
    const result = initializeItem({
      baseItem,
      groupFieldValue,
      hasPivotField: true,
      keyPrefix,
      linearData: true,
    });

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(3);
  });
});
