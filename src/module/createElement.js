function createElement(vd) {
  // 处理文本情况
  if(vd.type === "String") {
    return document.createTextNode(vd.value);
  };

  if(vd.type === "Fragment") {
    const $el = document.createDocumentFragment();
    // 遍历子节点创建真实dom
    vd.children?.forEach(child=> {
      $el.appendChild(createElement(child));
    });
    return $el;
  }

  if(vd.type === "Tag") {
    const $el = document.createElement(vd.nodeName);

    vd.props && Object.keys(vd.props).forEach((prop)=> {
      $el.setAttribute(prop, vd.props[prop]);
    });

    vd.children?.forEach(child=> {
      $el.appendChild(createElement(child));
    });
    return $el;
  }
}

export {
  createElement
};