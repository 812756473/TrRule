// 获取矩形头部连接点
export function getHeadPoint(rect) {
  return {
    x: rect.x,
    y: rect.y + rect.height / 2
  }
}
// 获取矩形尾部连接点
export function getTailPoint(rect) {
  return {
    x: rect.x + rect.width,
    y: rect.y + rect.height / 2
  }
}
export function getRectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  }
}
export function getLineCenter(line) {
  return {
    x: (line.startPoint.x + line.endPoint.x) / 2,
    y: (line.startPoint.y + line.endPoint.y) / 2
  }
}
export function getLineBorder(line) {
  const width = 30
  const height = 20
  return {
    x: (line.startPoint.x + line.endPoint.x - width) / 2,
    y: (line.startPoint.y + line.endPoint.y - height) / 2,
    width,
    height
  }
}
// 解析数据源
export function parseDataSource(data, params) {
  if (data instanceof Function) {
    return data(params)
  } else if (data instanceof Array) {
    return data
  } else {
    return []
  }
}
/**
 * 获取节点的空白区域：Rect数组
 * @param {Vertex} vertex Vertex对象
 * @param {Number} NODE_HEIGHT 节点初始化高度
 * @param {String} position 空白区域的位置：top上方，bottom下方
 * @returns
 */
export function getBlankAreas(vertex, NODE_HEIGHT, position) {
  const results = []
  const vertexRect = vertex.rect
  let curr = vertex
  let arr = curr.toVertices()
  while (arr.length > 0) {
    curr = position === 'bottom' ? arr[arr.length - 1] : arr[0]
    arr = curr.toVertices()
    const currRect = curr.rect
    const fromVertex = curr.fromVertex() || vertex
    const rect = {
      x: vertexRect.x,
      y: currRect.y,
      width: currRect.x - vertexRect.x,
      height: (fromVertex.rect.height - NODE_HEIGHT) / 2
    }
    if (rect.height > 0) results.push(rect)
  }
  console.log(`${vertex.data.name}.results = `, results)
  return results
}

/**
 * isRectIn方法的复数形式
 * @param {rect} curr 当前矩形
 * @param {Array} rects 目标矩形数组
 * @returns true|false
 */
export function isRectInArr(curr, rects) {
  if (rects.length === 0) return false
  for (let i = rects.length - 1; i >= 0; i--) {
    if (isRectIn(curr, rects[i])) return true
  }
  return false
}
/**
 * 判断矩形是否包裹在另一个矩形中
 * @param {rect} smallOne 当前矩形
 * @param {rect} bigOne 目标矩形
 * @returns  true|false
 */
function isRectIn(smallOne, bigOne) {
  if (smallOne.width > bigOne.width || smallOne.height > bigOne.height) return false

  const leftTopPoint = {
    x: smallOne.x,
    y: smallOne.y
  }
  const rightBottomPoint = {
    x: smallOne.x + smallOne.width,
    y: smallOne.y + smallOne.height
  }
  return isPointIn(leftTopPoint, bigOne) && isPointIn(rightBottomPoint, bigOne)
}
function isPointIn(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

// eslint-disable-next-line no-unused-vars
function _setFatherAndFatherAttrs(node, offsetH) {
  node.rect.height += offsetH
  this._setAttrsByRect(node)
  let father = node.fromVertex()
  while (father && !father.isRoot) {
    this._setAttrsByRect(father)
    father = father.fromVertex()
  }
}
// eslint-disable-next-line no-unused-vars
function _setAttrsByRect(node) {
  const { y, height } = node.rect
  node.attrs.y = y + height / 2 - node.attrs.height / 2
}
export function traverse(node, fun) {
  if (!node) return
  fun(node)
  if (node.children) {
    node.children.forEach((child) => {
      traverse(child, fun)
    })
  }
}
// 初始化rect
export const INIT_RECT = {
  x: 0,
  y: 0,
  offsetY: 0,
  width: 0,
  height: 0
}
