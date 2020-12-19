// 常量 
const WHITE_SPACE = /\s/;// 空格
const PAREN = /(<|>)/;
const CHAR = /[\s\S]/;// 任意字符
const NUMBERS = /[0-9\.]/;
const STRING_SYMBOL = /('|")/;
const SLASH = /[\\\/]/;
const UNALLOWED_NAME = /[^A-Za-z0-9_$-]/;// 检测非法名称

// 匹配注释
const XML_COMMENTS = /<!--(.)*-->/igs;

// 检测是否是自闭合标签
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

// 前置转换
function preTransform(input) {
  let result;
  // 删除所有的注释
  result = input.replace(XML_COMMENTS, '');
  return result;
}

function tokenizer(input) {
  let current = 0;
  let tokens = [];
  const length = input.length;
  // 在标签内部会强制引号才作为字符,标签外部则都为字符
  let inTag = false;
  while (current < length) {
    let char = input[current];
    // 解析字符串
    const parseStringToken = () => {
      let symbol = char;
      let value = '';
      // 跳过双引号(自身)
      char = input[++current];
      while (char && char !== symbol) {
        value += char;
        char = input[++current];
      }
      return value;
    }
    // 解析html中字符
    const parseStringTokenOutTag = () => {
      let value = '';
      while (char && char !== '<') {
        value += char;
        char = input[++current];
      }
      char = input[current--];
      value = value.replace(/\r\n/g, '');
      return value;
    }

    if (char === '<') {
      tokens.push({
        type: 'paren',
        value: char
      });
      inTag = true;
    } else if (char === '>') {
      tokens.push({
        type: 'paren',
        value: char
      });
      inTag = false;
    }else {
      if (inTag) {
        if (char === '=') {
          tokens.push({
            type: 'equal',
            value: char
          });
        } else if (WHITE_SPACE.test(char)) {

        } else if (STRING_SYMBOL.test(char)) {
          tokens.push({
            type: 'string',
            value: parseStringToken()
          });
        } else if (NUMBERS.test(char)) {
          let value = '';
          while (char && NUMBERS.test(char)) {
            value += char;
            char = input[++current];
          }
          // 减去 以免下面在++就是加了2
          current--;
          tokens.push({
            type: 'number',
            value
          });
        } else if (CHAR.test(char)) {
          // 记录尖括号数量几个开始对应几个结束，防止内部尖括号结束外部标签
          let parenNumber = 0;
          let value = '';
          while (char && !WHITE_SPACE.test(char) && CHAR.test(char)) {
            // 检测到引号就当成连续字符，可以含有空格，直到下个引号
            if (STRING_SYMBOL.test(char)) {
              value += parseStringToken();
              char = input[++current];
              continue;
            }
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
      } else {
        // 处理标签尖括号外部的情况
        const value = parseStringTokenOutTag().trim();
        value.replace(/[\↵\r\n\s]/g, '').length > 0 ?
        tokens.push({
          type: 'string',
          // 替换换行，多个空格缩短为1个
          value: value.replace(/[\↵\r\n]/g, '').replace(/\s+/g, ' ')
        }) : null;
      }
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
        props: []
      }

      token = tokens[++current];
      while (token && token.value !== '>') {
        const node = parse();
        node && tag.props.push(node);
        token = tokens[current];
      }

      const isEndTag = tag.props.every(token => {
        // 验证第一个字符是/则为结束标签
        return SLASH.test(token.value[0]);
      });

      //设定返回值
      //设置类型
      if (tag.props[0]) {
        if (tag.props[0].value !== '/') {
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
          tag.nodeName = tag.props[0].value.replace('/', '');
        } else {
          tag.nodeName = tag.props[0].value;
          tag.props = tag.props.slice(1);
        }
      } else {
        // delete tag.props;
        tag.nodeName = '';
      }

      // 如果是自闭合标签就删除所有的/
      isAutoClousureTag(tag.nodeName) ? tag.props = tag.props.filter(v => v.value !== '/') : null;

      // 如果是无法识别的标签添加了结束符号/，则视为自定义节点单标签
      if (tag.props[tag.props.length - 1] && tag.props[tag.props.length - 1].value === '/') {
        tag.clousure = true;
        // 删除闭合符/
        tag.props = tag.props.filter(v => v.value !== '/');
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
  let ast = {
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
  // 如果小于等于1，就是单个元素，多于一个，就是文档碎片
  ast.children.length <= 1 && (ast = ast.children[0]);
  return ast;
}

function traverser(ast) {
  if (ast && ast.children && ast.children.length > 0) {
    ast.children.forEach(node => {
      traverser(node);
    });
  }
  // 删除节点类型中的Literal
  ast.type = ast.type.replace('Literal', '');
  if(ast.props && ast.props.length > 0) {
    // 把ast.props转换为一个对象
    const props = ast.props;
    ast.props = {};
    props.forEach(v => {
      // 删除属性中的Literal
      v.type = v.type.replace('Literal', '');
      // 如果没有赋值则默认设置为true，赋值了就直接赋值
      if(v.type === 'Expression') {
        ast.props[v.value.key] = v.value.value;
      }
      else if (v.type === 'Name') {
        ast.props[v.value] = true;
      }
      return v;
    });
  }
  // 因为已经解析完毕标签了，所以删除一些东西
  // 删除标签结束标识
  ast.clousure ? delete ast.clousure : null;
  // 删除value属性，不再需要标记start和end
  if (ast.type === 'Tag' || ast.type === 'Fragument') {
    delete ast.value
  }
  return ast;
}

function parser(tokens) {
  return parseToTree(parseToNode(tokens));
}

function compileXMLToAST(input) {
  try {
    // 去除注释，获得有用的数据部分
    const usefulData = preTransform(input);
    const tokens = tokenizer(usefulData);
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

export {
  compileXMLToAST
};