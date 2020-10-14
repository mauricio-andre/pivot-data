module.exports = ({
  columnMap,
  countCurrentItems,
  countNewItems,
  key,
  keyPrefix = '',
  linearData,
  pivotFieldValue,
}) => {
  if (columnMap && Object.keys(columnMap).length > 0) {
    return columnMap[`${pivotFieldValue}_${key}`];
  }

  if (linearData) {
    key = countNewItems;
    if (keyPrefix) {
      key += countCurrentItems;
    }
  }

  return `${keyPrefix}${key}`;
};
