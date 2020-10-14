module.exports = ({
  currentItems,
  hasPivotField,
  linearData,
  newItems,
  pivotFieldValue,
}) => {
  if (!linearData && hasPivotField) {
    if (!currentItems[pivotFieldValue]) {
      currentItems[pivotFieldValue] = [];
    }

    currentItems[pivotFieldValue].push(newItems);
    return currentItems;
  }
  if (linearData && Array.isArray(currentItems)) {
    return [...currentItems, ...newItems];
  }

  currentItems.push(newItems);
  return currentItems;
};
