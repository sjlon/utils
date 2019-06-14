let utils = {
    /**
     * 是否为对象类型
     * @param {*} obj 目标对象
     */
    isObject(obj) {
        return typeof obj === 'object'
    },
    isNull(obj) {
        return obj === null
    },
    /**
     * 判断目标是否定义
     * @param {*} obj 目标对象
     */
    isDefined(obj) {
        return typeof obj !== undefined
    },
    /**
     * 是否未定义
     * @param {*} obj 目标对象
     */
    isUndefined(obj) {
        return typeof obj === 'undefined'
    },
    /**
     *  是否为数组类型
     * @param {*} obj
     */
    isArray(obj) {
        return utils.isDefined(obj) && obj instanceof Array
    },
    /**
     * 是否是function
     *
     * @param {*} obj
     * @returns
     */
    isFunction(obj) {
        return typeof obj === 'function'
    },
    /**
     * 是否是数组类型
     *
     * @param {*} obj
     * @returns
     */
    isNumber(obj) {
        return typeof obj === 'number'
    },
    /**
     * 对象深拷贝
     * @param {*} obj 拷贝对象
     */
    deepCopy(obj) {
        let newObj
        if (utils.isObject(obj)) {
            newObj = {}
            utils.each(obj, (prop, key) => {
                newObj[key] = utils.isObject(prop) ? utils.deepCopy(prop) : prop
            })
        } else {
            newObj = obj
        }
        return newObj
    },
    /**
     * 循环方法， 可以一致性的执行数据与对象的遍历
     * @param {*} list  循环对象
     * @param {*} callback  回调函数
     */
    each(list, callback) {
        list = list || []
        if(utils.isArray(list)) {
            // 使用倒序时可以进行安全删除！！
            for(let index = list.length - 1; index >= 0; index--) {
                let result = callback(list[index], index)
                if (result) {
                    break
                }
            }
        } else if(utils.isObject(list)) {
            let keys = Object.keys(list)
            for (let key of keys) {
                let result = callback(list[key], key)
                if (result) {
                    break
                }
            }
        }
    },
    /**
     * 比较两个对象是否完全相等
     *
     * @param {*} source 源对象
     * @param {*} target 目标对象
     */
    equals(source, target) {
        if(source === target) {
            return true
        }
        // 不是对象，直接返回两者比较的结果
        if (!utils.isObject(source) || !utils.isObject(target)) {
            return source === target
        } else if (utils.isNull(source) || utils.isNull(target)) {
            // 有一个是null，直接返回比较的结果
            return source === target
        }
        // 默认两者相等，如果找到不等的属性返回不等的结果
        let isEqual = true
        utils.each(source, (propVal, prop) => {
            isEqual = utils.equals(propVal, target[prop])
            return !isEqual //不等跳出循环
        })
        if (!isEqual) {
            return false
        }
        utils.each(target, function(propVal, prop) {
            isEqual = utils.equals(propVal, target[prop])
            return !isEqual //不等跳出循环
        })
        return isEqual
    },

    contains(item, target) {
        // 默认相等
        let isEqual = true
        utils.each(target, function(propVal, prop) {
            isEqual = utils.equals(propVal, item[prop])
            return !isEqual     // 不等返回true跳出循环
        })
        return isEqual
    },
    filter(list, iterator) {
        list = list || []
        if(utils.isFunction(iterator)) {
            return list.filter(iterator)
        } else if(utils.isObject(iterator)) {
            return list.filter(item => utils.contains(item, iterator))
        }
    },
    noop: function() {},
    stringLength(str) {
        str = str || ''
        let totalCount = 0
        for(let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i)
            if((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                totalCount++
            } else {
                totalCount += 2
            }
        }

        return totalCount
    },
    find(list, iterator) {
        let matchs = utils.filter(list, iterator)
        return matchs[0]
    },
    /**
     * 通过指字的过滤条件取得列表中符合条件的第一个或者默认对象（默认为空对象）
     * @param {*} list 列表
     * @param {*} filter 过滤条件
     * @param {*} defaultItem 默认项，不设置则为空对象
     */
    firstOrDefault(list, filter, defaultItem = {}) {
        list = list || []
        let items = list.filter(filter) || []
        return items[0] || defaultItem
    },
    /**
     * 检查列表当中是否存在与给定检查项相同_id的列表项。
     * @param {*} list 列表
     * @param {*} item 检查项,或者检查项的_id
     */
    hasItem(list, mapper) {
        if (!mapper) {
        return false
        }
        list = list || []
        if (utils.isObject(mapper)) {
        return !!list.filter(x => utils.contains(x, mapper)).length
        } else if (utils.isFunction(mapper)) {
        return !!list.filter(mapper).length
        } else {
        return utils.indexOf(list, mapper) >= 0
        }
    },
    /**
     * 去掉字符串前后的空格
     * @param {*} str 字符串对象
     */
    trim(str) {
        return str.replace(/^\s/, '').replace(/\s$/, '')
    },
    /**
     * 判断数组或对象是否为空，如果传入的不是数组或对象则始终会返回true
     * @param {*} item 数组或对象
     */
    isEmpty(item) {
        if (utils.isArray(item)) {
        return !item || !item.length
        } else if (utils.isObject(item)) {
        return !Object.keys(item).length
        } else {
        return true
        }
    },
  /**
   * 查询列表项，返回最先通过判断为真值的元素的 index
   * @param {Array} 需要搜索的数组
   * @param {Function|Object|string} 这个函数会在每一次迭代调用
   * @return {Number} 返回符合元素的 index，否则返回 -1
   */
  findIndex(list, iterator) {
    list = list || []
    let index = -1
    if (utils.isFunction(iterator)) {
      utils.forEach(list, (item, itemIndex) => {
        if (iterator(item)) {
          index = itemIndex
          return false
        }
      })
      return index
    } else if (utils.isObject(iterator)) {
      utils.forEach(list, (item, itemIndex) => {
        if (utils.contains(item, iterator)) {
          index = itemIndex
          return false
        }
      })
      return index
    } else {
      utils.forEach(list, (item, itemIndex) => {
        if (item[iterator] === true) {
          index = itemIndex
          return false
        }
      })
      return index
    }
  },
  /**
   * 查询列表项并返回其下标，如果传入的是对象则自动取其_id
   * @param {*} list 列表
   * @param {*} item 检查项,或者检查项的_id
   */
  indexOf(list, iterator) {
    list = list || []
    if (utils.isFunction(iterator)) {
      return list.indexOf(iterator)
    } else if (utils.isObject(iterator)) {
      return list.indexOf(item => utils.contains(item, iterator))
    } else {
      return list.indexOf(iterator)
    }
  },
  map(list, mapper) {
    return (list || []).map(mapper)
  },
  /**
   * 扩展对象，会把新对象的属性深度拷贝到老对象，而且会把新对象中没有的属性进行删除。
   * 执行后这两个对象值会完全一致，但内存栈地址不一样。
   * @param {*} oldItem 被扩展的对象
   * @param {*} newItem 扩展的新对象
   */
  extend(oldItem, newItem) {
    //把新的属性更新到老对象
    utils.each(newItem, function(newProp, propKey) {
      let oldProp = oldItem[propKey]
      //如果属性为对象则进行尝试的递归替换
      if (utils.isObject(newProp) && utils.isObject(oldProp)) {
        utils.extend(oldItem[propKey], newItem[propKey])
      } else {
        //如果新两者其一不是对象，则把旧对象深拷贝到旧对象。
        oldItem[propKey] = utils.copy(newItem[propKey])
      }
    })

    //把新属性中不存在属性移除。
    utils.each(oldItem, (oldProp, propKey) => {
      if (!newItem.hasOwnProperty(propKey)) {
        delete oldItem[propKey]
      }
    })
  },
    /**
     * 根据切割字符把字符串切割成多个。
     * @param {*} str 字符串
     * @param {*} splitters 切割字符
     */
    split(str, ...splitters) {
        let regSplitter = splitters.join('|')
        return str.split(new RegExp(`[${regSplitter}]`, 'g')).map(x => utils.trim(x))
    },
    /**
     * 数组去重
     * @param {*} list 数组
     */
    distinct(list) {
        let newList = []
        utils.each(list, (item, index) => {
        if (!utils.hasItem(newList, item)) {
            newList.push(item)
        }
        })
        return newList
    },
    /**
     * 循环方法，可以一致性地执行数据与对象的遍历。
     * @param {*} list 循环对象
     * @param {*} callback 回调函数
     */
    forEach(list, callback) {
        list = list || []
        if (utils.isArray(list)) {
            for (let index = 0; index < list.length; index++) {
                let result = callback(list[index], index)
                if (result === false) {
                    break
                }
            }
        } else if (utils.isObject) {
            let keys = Object.keys(list)
            for (let key of keys) {
                let result = callback(list[key], key)
                if (result === false) {
                    break
                }
            }
        }
    },
    co(gen) {
        let g = gen()
        function next(data) {
          let result = g.next(data)
          if (result.done) {
            return result.value
          }
          result.value.then(data => next(data))
        }
        next.bind(this)
        next()
      },
      wrapPromise(handler, options) {
        options = options || {}
        return new Promise((resolve, reject) => {
            options.success = function(res) {
                resolve(res)
            }
            options.fail = function(err) {
                reject(err)
            }
            handler(options)
        })
    },
    /**
   * 使用数组迭代的方式操作promise数组，数组中的promise会一个个按序执行
   * 如果promises中传入的是方法，程序将同样在指定顺序执行这个方法 。
   * TIP:如果中途发生异常循环则不会再往下执行，而是直接去到finallCb中。
   * @param {*} param0 promises
   * @param {*} iteratorCb 迭代回调
   * @param {*} finallyCb 最后状态回调
   */
    eachPromises([...promises], iteratorCb, finallyCb) {
        iteratorCb = iteratorCb || utils.noop
        finallyCb = finallyCb || utils.noop
        return new Promise((resolve, reject) => {
            if (promises.length <= 0 || !utils.isFunction(iteratorCb)) {
                throw 'iteratorCb 必需有一个回调方法且promises不能为空'
            }

            let results = []
            let hasError = false

            function next(index) {
                let promise = promises[index](results)

                if (promise.then) {
                    //如果是promise的话就用promise的方式操作。
                    promise.then((res) => {
                        results[index] = res
                        iteratorCb(results, index)
                        if (index < promises.length - 1) {
                            next(++index)
                        } else {
                            finallyCb(results, hasError)
                            resolve(res)
                        }
                    }, err => {
                        results[index] = err
                        hasError = true
                        finallyCb(results, hasError, index)
                        reject(err)
                    })
                } else if (utils.isFunction(promise)) {
                    //如果是方法则用方法的方式操作
                    let res = promise()
                    results[index] = res
                    iteratorCb(results, index)
                    if (index < promises.length - 1) {
                        next(++index)
                    } else {
                        finallyCb(results, hasError, index)
                        resolve(res)
                    }
                }
            }
            next(0)

        })
    }
}

module.exports = utils
