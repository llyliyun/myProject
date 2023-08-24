import tools from '@/api/tools';
import store from '@/store';

/**
 * 复制对象
 * @param obj
 * @param keys
 * @return {{}|any}
 */
const copyObject = (obj, ...keys) => {
  if (keys.length === 0) {
    return JSON.parse(JSON.stringify(obj));
  } else {
    let tempObj = {};
    for (const key in keys) {
      for (const i in obj) {
        if (keys[key] === i) {
          tempObj = {
            ...tempObj,
            [keys[key]]: obj[i]
          }
          break;
        }
      }
    }
    return tempObj;
  }
};

/**
 * 复制对象 忽略部分
 * @param obj
 * @param ignore
 * @returns {any}
 */
const copyObjectIgnore = (obj, ...ignore) => {
  if (ignore.length === 0) {
    return JSON.parse(JSON.stringify(obj));
  } else {
    let tempObj = JSON.parse(JSON.stringify(obj));
    for (const key in tempObj) {
      if (ignore.includes(key)) {
        delete tempObj[key];
      }
    }
    return tempObj;
  }
};


/**
 * 复制对象 插入部分
 * @param obj
 * @param insert
 * @returns {any}
 */
const copyObjectInsert = (obj, ...insert) => {
  if (insert.length === 0) {
    return JSON.parse(JSON.stringify(obj));
  } else {
    let tempObj = JSON.parse(JSON.stringify(obj));
    for (let i = 0; i < insert.length; i = i + 2) {
      tempObj = {
        ...tempObj,
        [insert[i]]: insert[i + 1]
      }
    }
    return tempObj;
  }
};

/**
 * 是否有某个按钮的权限
 * @param key
 * @return {boolean}
 */
const hasLimit = (key) => {
  const per = store.getters.permissions;
  const all = per.findIndex(item => {
    return item === '*:*:*'
  });
  if (all !== -1) {
    return true;
  }
  const index = per.findIndex(item => {
    return item === key
  });
  return index !== -1;
}

export default {
  ...tools, // 公共接口类
  copyObject, // 复制对象
  copyObjectIgnore, // 复制对象 忽略部分
  copyObjectInsert, // 复制对象 插入部分
  hasLimit, // 校验是否有权限
}

/**
 * 重置表单
 * @param refName
 * @param keys
 */
export function resetForm(refName, ...keys) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
    if (keys.length > 0) {
      for (const key in keys) {
        this.$refs[refName].model[keys[key]] = '';
      }
    }
  }
}
