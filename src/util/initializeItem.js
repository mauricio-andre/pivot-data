module.exports = ({
  baseItem,
  groupFieldValue,
  hasPivotField,
  keyPrefix = '',
  linearData,
}) => {
  let item = Array.isArray(baseItem) ? [...baseItem] : { ...baseItem };
  if (Object.keys(baseItem).length <= 0) {
    item = [];
    if ((!linearData && hasPivotField) || (linearData && keyPrefix !== '')) {
      item = {};
    }
  }

  if (linearData) {
    groupFieldValue.forEach((value, index) => {
      item[`${keyPrefix}${index}`] = value;
    });
  }

  return item;
};
