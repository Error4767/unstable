// 常量 
const WHITE_SPACE = /\s/;// 空格
const PAREN = /(<|>)/;
const CHAR = /[\s\S]/;// 任意字符
const NUMBERS = /[0-9\.]/;
const STRING_SYMBOL = /('|")/;
const SLASH = /[\\\/]/;
const UNALLOWED_NAME = /[^A-Za-z0-9_$-]/;// 检测非法名称

//检测是否是自闭合标签
const autoClousureTags = [
  'meta',
  'link',
  'base',
  'br',
  'hr',
  'input',
  'img'
];
const isAutoClousureTag = (tag) => autoClousureTags.includes(tag);

function tokenizer(input) {
  let current = 0;
  let tokens = [];
  const length = input.length;
  while (current < length) {
    let char = input[current];
    if (char === '<') {
      tokens.push({
        type: 'paren',
        value: char
      });
    } else if (char === '>') {
      tokens.push({
        type: 'paren',
        value: char
      });
    } else if (char === '=') {
      tokens.push({
        type: 'equal',
        value: char
      });
    } else if (WHITE_SPACE.test(char)) {

    } else if (STRING_SYMBOL.test(char)) {
      let symbol = char;
      let value = '';
      // 跳过双引号(自身)
      char = input[++current];
      while (char && char !== symbol) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'string',
        value
      });
    } else if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value
      });
    } else if (CHAR.test(char)) {
      // 记录尖括号数量几个开始对应几个结束，防止内部尖括号结束外部标签
      let parenNumber = 0;
      let value = '';
      while (char && !WHITE_SPACE.test(char) && CHAR.test(char)) {
        if (PAREN.test(char)) {
          if (parenNumber <= 0) {
            break;
          }
          char === '<' && parenNumber++;
          char === '>' && parenNumber--;
        }
        value += char;
        char = input[++current];
      }
      // 减去 以免下面在++就是加了2
      current--;
      const token = !UNALLOWED_NAME.test(value) ? {
        type: 'name',
        value
      } : {
          type: 'expression',
          value
        };
      tokens.push(token);
    }
    current++;
  }
  return tokens;
}

function parseToNode(tokens) {
  let current = 0;
  const length = tokens.length;
  function parse() {
    if (current >= length) {
      return;
    }
    let token = tokens[current];
    if (!token) {
      current++;
      return;
    }
    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value
      };
    } else if (token.type === 'string') {
      current++;
      return {
        type: 'StringLiteral',
        value: token.value
      };
    } else if (token.type === 'name') {
      current++;
      return {
        type: 'NameLiteral',
        value: token.value
      };
    } else if (token.type === 'expression') {
      current++;
      // 根据等于号分割表达式
      const contents = token.value.split('=');
      // 长度大于1视为表达式，否则视为名字，
      if (contents.length > 1) {
        let value = contents[1];
        //如果包裹引号，视为字符，去掉引号
        const isString = STRING_SYMBOL.test(contents[1][0]) && STRING_SYMBOL.test(contents[1][contents[1].length - 1]);
        isString ? value = contents[1].replace(/('|")/g, '') : null;
        return {
          type: 'ExpressionLiteral',
          value: {
            key: contents[0],
            value
          }
        }
      } else {
        return {
          type: 'NameLiteral',
          value: token.value
        }
      }
    } else if (token.type === 'paren' && token.value === '<') {
      let tag = {
        attrs: []
      }

      token = tokens[++current];
      while (token && token.value !== '>') {
        const node = parse();
        node && tag.attrs.push(node);
        token = tokens[current];
      }

      const isEndTag = tag.attrs.every(token => {
        // 验证第一个字符是/则为结束标签
        return SLASH.test(token.value[0]);
      });

      //设定返回值
      //设置类型
      if (tag.attrs[0]) {
        if (tag.attrs[0].value !== '/') {
          tag.type = 'TagLiteral';
        } else {
          tag.type = 'Fragument';
        }
        isEndTag ? tag.value = 'end' : tag.value = 'start';
      } else {
        tag.type = 'Fragument';
        tag.value = 'start';
      }
      //如果不是文档碎片，则可以有名字和属性
      if (tag.type !== 'Fragument') {
        if (isEndTag) {
          tag.nodeName = tag.attrs[0].value.replace('/', '');
        } else {
          tag.nodeName = tag.attrs[0].value;
          tag.attrs = tag.attrs.slice(1);
        }
      } else {
        //delete tag.attrs;
        tag.nodeName = '';
      }

      //如果是自闭合标签就删除所有的/
      isAutoClousureTag(tag.nodeName) ? tag.attrs = tag.attrs.filter(v => v.value !== '/') : null;

      //如果是无法识别的标签添加了结束符号/，则视为自定义节点单标签
      if (tag.attrs[tag.attrs.length - 1] && tag.attrs[tag.attrs.length - 1].value === '/') {
        tag.clousure = true;
        //删除闭合符/
        tag.attrs = tag.attrs.filter(v => v.value !== '/');
      }

      return tag;
    } else {
      current++;
      return;
    }
  }
  let nodes = [];
  while (current < length) {
    const node = parse();
    node && nodes.push(node);
  }
  return nodes;
}

// 解析语法，生成ast
function parseToTree(nodes) {
  let current = 0;
  const length = nodes.length;
  const ast = {
    // 这里Fragument只是指这个编译器用于生成VNODE,没有更元素，使用Fragument
    type: 'Fragument',
    children: []
  }
  function parse() {
    let node = nodes[current];
    if (
      node
      //检查类型
      && (node.type === 'TagLiteral' || node.type === 'Fragument')
      //检测是否是开始标签
      && node.value === 'start'
      //跳过自闭合标签
      && !isAutoClousureTag(node.nodeName)
      //跳过自定义闭合单标签
      && !node.clousure
    ) {
      // 记录当前元素，便于后面添加node
      const parent = node;
      parent.children = [];
      // 自增，获取下个标签
      node = nodes[++current];

      // 判断下个标签是否是元素,是则递归,若是结束标签就结束while
      while (node) {
        // 获取元素，如果是元素则继续向下分析
        node = parse();
        // 遇到结束标签终结本次while
        if ((node.type === 'TagLiteral' || node.type === 'Fragument') && node.value === 'end') {
          break;
        }
        node && parent.children.push(node);
      }
      return parent;
    } else {
      current++;
      return node;
    }
  }
  while (current < length) {
    const node = parse();
    if (node) {
      ast.children.push(node);
    }
  }
  return ast;
}

function traverser(ast) {
  if (ast && ast.children && ast.children.length > 0) {
    ast.children.forEach(node => {
      traverser(node);
    });
  }
  //删除节点类型中的Literal
  ast.type = ast.type.replace('Literal', '');
  //删除属性中的Literal
  ast.attrs && ast.attrs.length > 0 ? ast.attrs = ast.attrs.map(v => {
    v.type = v.type.replace('Literal', '');
    return v;
  }) : null;
  //因为已经解析完毕标签了，所以删除一些东西
  //删除标签结束标识
  ast.clousure ? delete ast.clousure : null;
  //删除value属性，不再需要标记start和end
  if (ast.type === 'Tag' || ast.type === 'Fragument') {
    delete ast.value
  }
  return ast;
}

function parser(tokens) {
  return parseToTree(parseToNode(tokens));
}

function compiler(input) {
  try {
    const tokens = tokenizer(input);
    const ast = parser(tokens);
    const newAst = traverser(ast);
    return newAst;
  } catch (err) {
    return {
      type: 'error',
      error: err.toString()
    }
  }
}

export default compiler;