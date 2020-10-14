const faker = require('faker');
const pivotData = require('../src/pivotData');

describe('pivotData', () => {
  const data = [];
  const keyPrefix = 'Cd_';
  const productMaterial = faker.commerce.productMaterial();
  const productNameList = [];
  const colorList = ['Red', 'Blue', 'Yellow', 'Green', 'black', 'white'];
  const nameAndDepartmentList = [];
  let numberColors = colorList.length;

  for (let index = 0; index < 10; index += 1) {
    const productName = faker.commerce.product();
    if (!productNameList.includes(productName)) {
      productNameList.push(productName);

      for (let indexColor = 0; indexColor < numberColors; indexColor += 1) {
        const department = faker.commerce.department();

        const nameAndDepartment = `${productName}-${department}`;
        if (!nameAndDepartmentList.includes(nameAndDepartment)) {
          nameAndDepartmentList.push(nameAndDepartment);
        }

        data.push({
          productName,
          color: colorList[indexColor],
          price: faker.commerce.price(),
          department,
          productMaterial,
        });
      }

      numberColors -= 1;
      if (numberColors <= 0) {
        numberColors = colorList.length;
      }
    }
  }

  it('Should return error if date is null', () => {
    expect(pivotData).toThrowError(new Error("Field 'data' is required"));
  });

  it('Should return error if date does not contain any items', () => {
    expect(() => {
      pivotData([]);
    }).toThrowError(new Error("Field 'data' must be an array with items"));
  });

  it('Should return error if groupField is null', () => {
    expect(() => {
      pivotData(data);
    }).toThrowError(new Error("Field 'groupField' is required"));
  });

  it('Should return an object with the data, lineMap, columnMap and map properties', () => {
    const result = pivotData(data, { groupField: 'productName' });

    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('lineMap');
    expect(result).toHaveProperty('columnMap');
    expect(result).toHaveProperty('map');
  });

  it('Should be possible to group by index into a array', () => {
    const tempProductName = faker.commerce.product();
    const result = pivotData(
      [
        [tempProductName, colorList[0], faker.commerce.price()],
        [faker.commerce.product(), colorList[2], faker.commerce.price()],
        [tempProductName, colorList[1], faker.commerce.price()],
      ],
      { groupField: 0 }
    );

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data[0]).toHaveLength(5);
  });

  it('Should be possible to group by name and department', () => {
    const result = pivotData(data, {
      groupField: ['productName', 'department'],
      linearData: true,
    });

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data).toHaveLength(nameAndDepartmentList.length);
  });

  it('Should be possible to group by name and productMaterial returning an object', () => {
    const result = pivotData(data, {
      groupField: ['productName', 'productMaterial'],
      linearData: false,
    });

    expect(result.data).toBeInstanceOf(Object);
    productNameList.forEach((key) => {
      expect(result.data).toHaveProperty(key);
      expect(result.data[key]).toBeInstanceOf(Object);
    });

    const firstProductName = productNameList[0];
    const firstGroup = result.data[firstProductName][productMaterial];
    expect(firstGroup).toHaveLength(colorList.length);
  });

  it('Should be possible to group by name and pivot by color', () => {
    const result = pivotData(data, {
      groupField: 'productName',
      pivotField: 'color',
      linearData: true,
    });

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data).toHaveLength(productNameList.length);
    // todos os registros devem ter a mesma quantidade de elementos quando pivotField e linearData existem
    const totalCols = result.data[0].length;
    result.data.forEach((row) => {
      expect(row).toHaveLength(totalCols);
    });
  });

  it('Should be possible to group by name and pivot by color with prefix', () => {
    const result = pivotData(data, {
      groupField: 'productName',
      pivotField: 'color',
      linearData: true,
      keyPrefix,
    });

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data).toHaveLength(productNameList.length);
    // todos os registros devem ter a mesma quantidade de elementos quando pivotField e linearData existem
    const keys = Object.keys(result.data[0]);
    result.data.forEach((row) => {
      const currentKeys = Object.keys(row);
      expect(row).toBeInstanceOf(Object);
      expect(currentKeys).toEqual(keys);
    });
  });

  it('Should be possible to group by name and pivot by color returning an object', () => {
    const result = pivotData(data, {
      groupField: 'productName',
      pivotField: 'color',
      linearData: false,
    });

    expect(result.data).toBeInstanceOf(Object);
    productNameList.forEach((key) => {
      expect(result.data).toHaveProperty(key);
      expect(result.data[key]).toBeInstanceOf(Object);
      expect(colorList).toContain(Object.keys(result.data[key])[0]);
    });
  });

  it('Should be possible to group by name and return an object with a prefix in properties', () => {
    const result = pivotData(data, {
      groupField: 'productName',
      linearData: false,
      keyPrefix,
    });

    expect(result.data).toBeInstanceOf(Object);
    productNameList.forEach((key) => {
      expect(result.data).toHaveProperty(key);
      expect(result.data[key]).toBeInstanceOf(Array);
      expect(result.data[key][0]).toHaveProperty(`${keyPrefix}color`);
      expect(result.data[key][0]).toHaveProperty(`${keyPrefix}price`);
      expect(result.data[key][0]).toHaveProperty(`${keyPrefix}department`);
      expect(result.data[key][0]).toHaveProperty(`${keyPrefix}productMaterial`);
    });
  });
});
