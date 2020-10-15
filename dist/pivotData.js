/* @license pivot-data v1.0.2 | by mauricio-andre | (c) Infinitidata 2020 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.pivotData = factory());
}(this, (function () { 'use strict';

  var findNewKey = ({
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

  var initializeItem = ({
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

  var unifyItems = ({
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

  /**
   * @typedef {Object} ReturnData
   * @property {any}    data      Processed data set
   * @property {number} lineMap   Line reference for each grouped item
   * @property {number} columnMap Column reference for each item, available when
   *                              there are linearData and pivotField
   * @property {array}  map       Array with the set of values: groupField, pivotKeys, repeatKeys
   */

  /**
   * Pivot a table data set
   * @param {[Object|array]} data     Data to be processed
   * @param {Object}         params   Processing properties
   * @param {string|number|[string|number]}  params.groupField Data grouping field, is required
   * @param {string}  params.keyPrefix  Prefix to be concatenated with the keys
   * @param {boolean} params.linearData Returns data in array format
   * @param {string}  params.pivotField Field to be used as pivot
   * @return {ReturnData}
   */
  var pivotData = (data, params) => {
    if (!data) {
      throw new Error("Field 'data' is required");
    } else if (!Array.isArray(data) || data.length <= 0) {
      throw new Error("Field 'data' must be an array with items");
    } else if (!params || params.groupField === undefined) {
      throw new Error("Field 'groupField' is required");
    }

    if (!Array.isArray(params.groupField)) {
      params.groupField = [params.groupField];
    }

    const { groupField, keyPrefix = '', linearData = true, pivotField } = params;
    const emptyData = (forceObject) => (forceObject || !linearData ? {} : []);
    const createRef = (indexItem, item, groupFieldValue) => {
      let ref = item;
      let lastIndex = indexItem;

      if (!linearData) {
        const limitIndex = groupFieldValue.length - 1;
        groupFieldValue.forEach((value, index) => {
          ref[value] = ref[value] || {};
          lastIndex = value;
          if (limitIndex > index) {
            ref = ref[value];
          }
        });
      }

      return [ref, lastIndex];
    };

    const map = [];
    const lineMap = {};
    const columnMap = {};
    const countCurrentItems = [];
    const keys = Object.keys(data[0]);
    const baseItem = emptyData(keyPrefix);
    const pivotKeys = [];
    const repeatedKeys = keys.filter(
      (k) =>
        !groupField.some((field) => String(field) === String(k)) &&
        k !== String(pivotField)
    );
    let useBaseItem = false;

    /**
     * Create base object
     */
    if (linearData && pivotField) {
      useBaseItem = true;
      let countKeys = 0;
      groupField.forEach((field) => {
        const newKey = `${keyPrefix}${countKeys}`;
        baseItem[newKey] = null;
        columnMap[field] = newKey;
        countKeys += 1;
      });

      data.forEach((row) => {
        if (
          !groupField.includes(row[pivotField]) &&
          !pivotKeys.includes(row[pivotField])
        ) {
          pivotKeys.push(row[pivotField]);
          repeatedKeys.forEach((key) => {
            const newKey = `${keyPrefix}${countKeys}`;
            baseItem[newKey] = null;
            columnMap[`${row[pivotField]}_${key}`] = newKey;
            countKeys += 1;
          });
        }
      });
    }

    let ref = null;
    let lastIndex = 0;
    let lastGroupFieldKey = null;
    map.push(groupField, pivotKeys, repeatedKeys);
    const newData = data.reduce((dataResult, item) => {
      const groupFieldValue = groupField.map((field) => item[field]);
      const groupFieldKey = groupFieldValue.join('_');
      const pivotFieldValue = pivotField && item[pivotField];

      if (!Object.hasOwnProperty.call(lineMap, groupFieldKey)) {
        const indexItem = linearData
          ? Object.keys(lineMap).length
          : groupFieldValue[0];

        [ref, lastIndex] = createRef(indexItem, dataResult, groupFieldValue);

        lastGroupFieldKey = groupFieldKey;
        lineMap[groupFieldKey] = indexItem;
        countCurrentItems[indexItem] = groupField.length;
        ref[lastIndex] = initializeItem({
          linearData,
          hasPivotField: Boolean(pivotField),
          keyPrefix,
          groupFieldValue,
          baseItem,
        });
      }

      let countNewItems = 0;
      const indexItem = lineMap[groupFieldKey];
      const newItems = repeatedKeys.reduce((lineResult, key) => {
        const newKey = findNewKey({
          columnMap,
          countCurrentItems: countCurrentItems[indexItem],
          countNewItems,
          key,
          keyPrefix,
          linearData,
          pivotFieldValue,
        });
        lineResult[newKey] = item[key];

        if (useBaseItem) {
          dataResult[indexItem][newKey] = item[key];
        }

        countNewItems += 1;
        return lineResult;
      }, emptyData(keyPrefix));

      if (!useBaseItem) {
        if (lastGroupFieldKey !== groupFieldKey) {
          [ref, lastIndex] = createRef(indexItem, dataResult, groupFieldValue);
        }

        ref[lastIndex] = unifyItems({
          currentItems: ref[lastIndex],
          hasPivotField: Boolean(pivotField),
          linearData,
          newItems,
          pivotFieldValue,
        });
      }

      lastGroupFieldKey = groupFieldKey;
      countCurrentItems[indexItem] += countNewItems;

      return dataResult;
    }, emptyData());

    return { data: newData, lineMap, columnMap, map };
  };

  return pivotData;

})));
