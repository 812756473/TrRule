let count = 0
class Edge {
  constructor(from, to, value) {
    this.id = `edge_${Date.now()}_${++count}`
    this.from = from
    this.to = to
    this.value = value
  }
}

class Vertex {
  constructor(data) {
    this.id = `vertex_${Date.now()}_${++count}`
    this.data = data
    this.edges = new EdgeList()
    this.preEdge = null
    this.visited = false
    this.edgeTo = {}
    this.expand = true
    // 用于显示在视图的属性
    this.rect = { x: 0, y: 0, width: 100, height: 30 }
    this.attrs = { x: 0, y: 0, width: 100, height: 30 }
  }
  addEdge(edge) {
    this.edges.push(edge)
  }
  getDisplayEdges() {
    return this.expand ? this.edges : []
  }
  toVertices() {
    if (!this.expand) return []
    return this.edges.map(edge => edge.to)
  }
  isEqual(node) {
    return node.id === this.id
  }
  fromVertex() {
    return this.preEdge?.from
  }
  toString() {
    return this.data.toString()
  }
}
class EdgeList extends Array {}
class Graph {
  constructor() {
    this.vertices = []
    this.root = null
  }
  createVertex(value) {
    var matchVertices = this.vertices.filter(vertex => vertex.data === value)
    if (matchVertices.length > 0) {
      return matchVertices[0]
    }
    const newVertex = new Vertex(value)
    this.vertices.push(newVertex)
    if (this.vertices.length === 1) {
      this.root = this.vertices[0]
      this.root.isRoot = true
    }
    return newVertex
  }
  /**
   *
   * @param {*} vertex 需要删除的节点
   * @param {*} only 是否只删除当前节点， 默认false，false删除子节点 + 下级
   */
  deleteVertex(vertex, only = false) {
    // 删除子树
    if (only) {
      const index = this.vertices.indexOf(vertex)
      this.vertices.splice(index, 1)
    } else {
      // 删除子树
      _postorder(vertex, node => {
        const index = this.vertices.indexOf(node)
        this.vertices.splice(index, 1)
      })
    }
    // 删除指向它的边
    if (vertex.preEdge) {
      const edges = vertex.preEdge.from.edges
      const index = edges.indexOf(vertex.preEdge)
      edges.splice(index, 1)
    }
  }

  addEdge(from, to, value) {
    const edge = new Edge(from, to, value)
    from.addEdge(edge)

    to.preEdge = edge
    return edge
  }
  // 前序遍历 Preorder (Root, Left, Right)
  preorder(fun) {
    if (!this.root) return
    _preorder(this.root, fun)
  }
  // 后序遍历 Postorder (Left, Right, Root)
  postorder(fun) {
    if (!this.root) return
    _postorder(this.root, fun)
  }
  toObj() {
    const nodes = []
    const lines = []
    this.vertices.forEach(vertex => {
      nodes.push(vertex.data)
      vertex.edges.forEach(({ from, to }) => {
        lines.push({ fromId: from.data.id, toId: to.data.id })
      })
    })
    return { nodes, lines }
  }
  toString() {
    return JSON.stringify(this.toObj())
  }
  // 将字符串解析为Graph对象
  static parse(str) {
    let obj
    try {
      obj = JSON.parse(str)
    } catch (e) {
      throw new Error('JSON字符串解析错误：' + str)
    }
    return this.convert(obj)
  }
  /**
   * 将存储的对象转换为Graph对象，格式为：
   * {
   *  nodes: [{{ id: 7, name: '' }}],
      lines: [{fromId: '起始节点的id', toId: '结束节点的id'}]
     }
   * @param {*} obj  用于存储到数据库的对象，可序列化
   */
  static convert(obj) {
    // console.log(JSON.parse(JSON.stringify(obj)))
    const data = JSON.parse(JSON.stringify(obj))
    const graph = new Graph()
    try {
      const { nodes, lines } = data
      const nodeMap = {}
      nodes.forEach(node => {
        const vertex = graph.createVertex(node)
        nodeMap[node.id] = vertex
      })
      lines.forEach(({ fromId, toId }) => {
        graph.addEdge(nodeMap[fromId], nodeMap[toId])
      })
    } catch (e) {
      console.log(e)
      throw new Error('转换为Graph对象报错：' + JSON.stringify(data))
    }
    // console.log(graph)
    return graph
  }
}
function _preorder(target, fun) {
  fun(target)
  if (target.expand) {
    target.edges.forEach(edge => {
      _preorder(edge.to, fun)
    })
  }
}
function _postorder(target, fun) {
  if (target.expand) {
    target.edges.forEach(edge => {
      _postorder(edge.to, fun)
    })
  }
  fun(target)
}
export default Graph
