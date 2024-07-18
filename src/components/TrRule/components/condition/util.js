export function traverse(parent, children, fun) {
  if (!children) return
  children.forEach((item) => {
    if (item instanceof Array) {
      traverse(parent, item, fun)
    } else {
      fun(parent, item)
      if (item.children instanceof Array) {
        traverse(item, item.children, fun)
      }
    }
  })
}
