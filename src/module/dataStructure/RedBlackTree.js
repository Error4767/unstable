const parentMap = new WeakMap();

export class RedBlackTree {
    constructor() {
        let root = null;
        this.length = 0;
        Object.defineProperty(this, "root", {
            get() {
                return root;
            },
            set(value) {
                // 赋予 root 属性的时候如果root不为空，删除其在 parentMap 中的对应值，根部不存在 parent
                value && parentMap.delete(value);
                root = value;
                return root;
            },
        });
    }
    size() {
        return this.length;
    }
    _createNode(key, value, color = "red") {
        return new Proxy({
            key,
            value,
            color,
            left: null,
            right: null,
        }, {
            set(target, key, value, receiver) {
                if (["left", "right"].includes(key)) {
                    value && parentMap.set(value, receiver);
                    return Reflect.set(target, key, value, receiver);
                } else {
                    return Reflect.set(target, key, value, receiver);
                }
            }
        });
    }
    _isRed(node) {
        return node ? node.color === "red" : false;
    }
    // 变色（这个仅用于插入的情况）
    _flipColors(node) {
        node.color = "red";
        node.left.color = "black";
        node.right.color = "black";
    }
    // 左旋
    _leftRotate(node, { flipColors = true } = {}) {
        const x = node.right;
        node.right = x.left;
        x.left = node;
        if (flipColors) {
            const xColor = x.color;
            x.color = node.color;
            node.color = xColor;
        }
        return x;
    }
    // 右旋
    _rightRotate(node, { flipColors = true } = {}) {
        const x = node.left;
        node.left = x.right;
        x.right = node;
        if (flipColors) {
            const xColor = x.color;
            x.color = node.color;
            node.color = xColor;
        }
        return x;
    }
    insert(key, value) {
        this.root = this._insertNode(this.root, key, value);
        // 根节点设为黑
        this.root.color = "black";
    }
    _insertNode(node, key, value) {
        // 如果不存在创建一个节点返回
        if (!node) {
            this.length += 1;
            return this._createNode(key, value);
        }

        // 相同key直接覆盖值
        if (key < node.key) {
            node.left = this._insertNode(node.left, key, value);
        } else if (key > node.key) {
            node.right = this._insertNode(node.right, key, value);
        } else {
            node.value = value;
        }

        // 父节点为黑做动作
        if (!this._isRed(node)) {
            if (this._isRed(node.left) && this._isRed(node.right)) {
                this._flipColors(node);
            }

            // 左红左子红, 右旋
            if (this._isRed(node.left) && this._isRed(node.left.left)) {
                node = this._rightRotate(node);
            }
            // 左红右子红, 左测左旋，然后右旋
            if (this._isRed(node.left) && this._isRed(node.left.right)) {
                node.left = this._leftRotate(node.left);
                node = this._rightRotate(node);
            }

            // 上两个操作的镜像版本
            // 右红右子红，左旋
            if (this._isRed(node.right) && this._isRed(node.right.right)) {
                node = this._leftRotate(node);
            }
            // 右红左子红, 右侧右旋，然后左旋
            if (this._isRed(node.right) && this._isRed(node.right.left)) {
                node.right = this._rightRotate(node.right);
                node = this._leftRotate(node);
            }
        }

        return node;
    }
    find(key, { node = this.root } = {}) {
        let current = node;
        while (current) {
            if (key < current.key) {
                current = current.left;
            } else if (key > current.key) {
                current = current.right;
            } else {
                return current.value;
            }
        }
        return;
    }
    _findMaxNode(node = this.root) {
        let current = node;
        while (current.right) {
            current = current.right;
        }
        return current;
    }
    _findNode(key, { node = this.root } = {}) {
        let current = node;
        while (current) {
            if (key < current.key) {
                current = current.left;
            } else if (key > current.key) {
                current = current.right;
            } else {
                return current;
            }
        }
        return;
    }
    orderTraversalNode(node, handler, order) {
        if (node) {
            if (order === 'pre') {
                handler(node.value, node.key, this.root);
            }
            this.orderTraversalNode(node.left, handler, order);
            if (order === 'middle') {
                handler(node.value, node.key, this.root);
            }
            this.orderTraversalNode(node.right, handler, order);
            if (order === 'post') {
                handler(node.value, node.key, this.root);
            }
        }
    }
    preOrderTraversal(handler) {
        this.orderTraversalNode(this.root, handler, 'pre');
    }
    inOrderTraversal(handler) {
        this.orderTraversalNode(this.root, handler, 'middle');
    }
    postOrderTraversal(handler) {
        this.orderTraversalNode(this.root, handler, 'post');
    }
    sequenceTraversal(handler) {
        let nodes = [this.root];

        while (nodes.length > 0) {
            nodes.forEach(node => handler(node.value, node.key, this.root));
            // 存放新的一层
            const newNodes = [];
            // 遍历新的一层，将这层所有元素添加到 newNodes
            nodes.forEach(node => {
                node.left && newNodes.push(node.left);
                node.right && newNodes.push(node.right);
            });
            // 设置为新的一层
            nodes = newNodes;
        }
    }
    // 删除自己
    _deleteOwn(node) {
        const { parent, angel } = this._getParentAndAngel(node);
        parent[angel] = null;
        return node;
    }
    _getParentAndAngel(node) {
        const parent = parentMap.get(node);
        return {
            parent,
            angel: parent.left === node ? "left" : "right",
        };
    }
    _getParentAndProperty(node) {
        const parent = parentMap.get(node);
        if (parent) {
            return {
                parent,
                property: parent.left === node ? "left" : "right",
            }
        } else {// 无 parent, 就为 root
            return { parent: this, property: "root" };
        }
    }
    delete(key, { node = this.root } = {}) {
        const deleteTarget = this._findNode(key, { node });
        // 不存在被删除的节点，直接返回
        if (!deleteTarget) {
            return;
        }
        const value = deleteTarget.value;
        // 两侧都有子节点
        if (deleteTarget.left && deleteTarget.right) {
            // 如果左右都有，转化为替换删除，这里删前驱
            const replaceNode = this._findMaxNode(deleteTarget.left);
            const { key: replaceNodeKey, value: replaceNodeValue } = replaceNode;
            replaceNode.key = deleteTarget.key;
            replaceNode.value = deleteTarget.value;
            deleteTarget.key = replaceNodeKey;
            deleteTarget.value = replaceNodeValue;
            this.delete(key, { node: deleteTarget.left });
            return value;
        } else { // 不是两侧都有子节点
            // 被删节点有一个子节点
            // 唯一子节点
            const uniqueChild = deleteTarget.left || deleteTarget.right;
            // 有一个子节点, 则该节点和子节点必然一红一黑，因为一个黑色节点有一个黑色子节点违反了性质
            if (uniqueChild) {
                // 删掉那个单侧的节点
                this.length -= 1;
                if (deleteTarget.left) {
                    deleteTarget.left = null;
                } else {
                    deleteTarget.right = null;
                }
                // 替代, 固定黑色
                deleteTarget.color = "black";
                deleteTarget.key = uniqueChild.key;
                deleteTarget.value = uniqueChild.value;
                return value;
            } else { // 被删节点不存在子节点
                // 红色叶子，直接删除
                if (deleteTarget.color === "red") {
                    this.length -= 1;
                    this._deleteOwn(deleteTarget)
                    return value;
                } else { // 黑色叶子
                    // 删除节点为根节点
                    if (deleteTarget === this.root) {
                        this.length -= 1;
                        this.root = null;
                        return value;
                    }
                    // 删除黑色叶子节点的方法
                    const handleDeleteBlackLeaf = (node, isDelete = true) => {
                        if (node === this.root && !isDelete) {
                            // 到父节点，还有一个黑色权重，直接丢掉即可
                            return;
                        }
                        let { parent, angel: parentToNodeAngel } = this._getParentAndAngel(node);

                        const deleteNodeFn = () => (isDelete && (parent[parentToNodeAngel] = null, this.length -= 1));
                        let brother;
                        let rotateFn;
                        let brotherRotateFn;
                        let parentToBrotherAngel;
                        if (parentToNodeAngel === "left") {
                            brother = parent.right;
                            rotateFn = this._leftRotate;
                            brotherRotateFn = this._rightRotate;
                            parentToBrotherAngel = "right";
                        } else {
                            brother = parent.left;
                            rotateFn = this._rightRotate;
                            brotherRotateFn = this._leftRotate;
                            parentToBrotherAngel = "left";
                        }
                        // 获取祖父节点
                        const { parent: grandParent, property } = this._getParentAndProperty(parent);
                        // 兄弟节点为红色，旋转后转化另一种情况在处理
                        if (this._isRed(brother)) {
                            parent = rotateFn(parent);
                            grandParent[property] = parent;
                            
                            if (isDelete) {
                                this.delete(key, { node });
                            } else {
                                handleDeleteBlackLeaf(node, false);
                            }
                        } else { // 兄弟节点为黑色
                            // 有一个同方向红色子节点，旋转父节点，并且把孩子调黑
                            if (this._isRed(brother[parentToBrotherAngel])) {
                                deleteNodeFn();
                                parent = rotateFn(parent);
                                parent[parentToBrotherAngel].color = "black";
                                grandParent[property] = parent;
                                return value;
                            } else if (this._isRed(brother[parentToNodeAngel])) { // 有一个不同方向红色子节点, 旋转兄弟，转为上面的情况
                                deleteNodeFn();
                                // 旋转兄弟, 后变成上面的情况
                                parent[parentToBrotherAngel] = brotherRotateFn(brother);
                                // 和上面情况一样处理
                                parent = rotateFn(parent);
                                parent[parentToBrotherAngel].color = "black";
                                grandParent[property] = parent;
                                return value;
                            } else { // 没有红色子节点
                                // 父节点为红色
                                if (parent.color === "red") {
                                    deleteNodeFn();
                                    // 兄弟变红，父节点变黑
                                    brother.color = "red";
                                    parent.color = "black";
                                } else {// 父节点为黑色
                                    deleteNodeFn();
                                    // 兄弟变红
                                    brother.color = "red";
                                    // 向上递归操作，判断情况，但不删除
                                    handleDeleteBlackLeaf(parent, false);
                                }
                            }
                        }
                    }
                    handleDeleteBlackLeaf(deleteTarget);
                    return value;
                }
            }
        }
    }
}