/**
 * 数字方块消除游戏
 * 游戏规则：
 * 1. 系统自动产生颜色方块，方块上有1-9的数字
 * 2. 通过鼠标点击下方5x10的网格，数字方块会掉落下去
 * 3. 当方块碰到其他方块时进行加法计算，如果加起来等于10，两个方块会被消除并获得分数
 */

console.log('游戏脚本开始加载');

// 游戏常量
const GRID_COLS = 5;    // 网格列数
const GRID_ROWS = 10;   // 网格行数
const CELL_SIZE = 50;   // 方块大小（像素）
const GRID_OFFSET_X = 100; // 网格X偏移
const GRID_OFFSET_Y = 100; // 网格Y偏移
const FALLING_SPEED = 5; // 方块下落速度
const AUTO_FALLING_SPEED = 1; // 自动下落速度（比玩家点击后慢）
const NEXT_BLOCK_SIZE = 50; // 预览方块大小
const NEXT_BLOCKS_COUNT = 3; // 预览方块数量
const AUTO_DROP_DELAY = 300; // 自动下落前的延迟（毫秒）
const COLORS = [
    '#FF5252', // 红色
    '#FF4081', // 粉色
    '#7C4DFF', // 紫色
    '#536DFE', // 靛蓝
    '#448AFF', // 蓝色
    '#40C4FF', // 浅蓝
    '#18FFFF', // 青色
    '#69F0AE', // 绿色
    '#B2FF59'  // 黄绿色
];

// 游戏状态
let gameState = {
    score: 0,
    level: 1,
    blocks: [],        // 游戏中所有方块
    fallingBlock: null, // 当前正在下落的方块
    grid: [],          // 网格状态
    isGameRunning: false,
    isPaused: false,
    animationId: null,
    nextBlocks: [],     // 即将掉落的方块队列
    autoDropTimeout: null, // 自动下落的计时器
    isAutoFalling: false  // 是否处于自动下落状态
};

// 获取Canvas元素和上下文
const canvas = document.getElementById('game-canvas');

// 添加错误处理
if (!canvas) {
    console.error('找不到canvas元素!');
    throw new Error('Canvas元素未找到');
}

const ctx = canvas.getContext('2d');

if (!ctx) {
    console.error('无法获取canvas上下文!');
    throw new Error('无法获取Canvas上下文');
}

// 获取预览Canvas元素和上下文
const nextBlocksCanvas = document.getElementById('next-blocks-canvas');

if (!nextBlocksCanvas) {
    console.error('找不到next-blocks-canvas元素!');
    throw new Error('预览Canvas元素未找到');
}

const nextBlocksCtx = nextBlocksCanvas.getContext('2d');

if (!nextBlocksCtx) {
    console.error('无法获取next-blocks-canvas上下文!');
    throw new Error('无法获取预览Canvas上下文');
}

// 初始化游戏
function initGame() {
    console.log('初始化游戏');
    // 初始化网格
    gameState.grid = Array(GRID_ROWS).fill().map(() => Array(GRID_COLS).fill(null));
    
    // 初始化方块列表
    gameState.blocks = [];
    
    // 重置分数和级别
    gameState.score = 0;
    gameState.level = 1;
    updateScoreDisplay();
    updateLevelDisplay();
    
    // 清除自动下落计时器
    if (gameState.autoDropTimeout) {
        clearTimeout(gameState.autoDropTimeout);
        gameState.autoDropTimeout = null;
    }
    
    gameState.isAutoFalling = false;
    
    // 初始化预览方块队列 - 重写这部分
    console.log('初始化预览方块队列');
    
    // 先清空现有的队列
    gameState.nextBlocks = [];
    
    // 手动创建三个预览方块
    const block1 = createNextBlock();
    const block2 = createNextBlock();
    const block3 = createNextBlock();
    
    // 将它们添加到队列中
    gameState.nextBlocks.push(block1);
    gameState.nextBlocks.push(block2);
    gameState.nextBlocks.push(block3);
    
    console.log('预览方块1:', block1.number);
    console.log('预览方块2:', block2.number);
    console.log('预览方块3:', block3.number);
    console.log('预览队列状态:', gameState.nextBlocks.map(b => b.number).join(', '));
    
    // 绘制初始游戏界面
    drawGame();
    drawNextBlocks();
}

// 更新分数显示
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
}

// 更新级别显示
function updateLevelDisplay() {
    document.getElementById('level').textContent = gameState.level;
}

// 随机生成1-9的数字
function getRandomNumber() {
    return Math.floor(Math.random() * 9) + 1;
}

// 随机选择颜色
function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// 创建新的方块对象
function createBlock(col, row, number, color) {
    return {
        col,
        row,
        x: GRID_OFFSET_X + col * CELL_SIZE,
        y: GRID_OFFSET_Y + row * CELL_SIZE,
        number,
        color,
        isFalling: false
    };
}

// 创建预览方块对象（不包含位置信息）
function createNextBlock() {
    return {
        number: getRandomNumber(),
        color: getRandomColor()
    };
}

// 生成即将掉落的方块队列
function generateNextBlocks() {
    // 确保预览队列始终有指定数量的方块
    while (gameState.nextBlocks.length < NEXT_BLOCKS_COUNT) {
        const newBlock = createNextBlock();
        gameState.nextBlocks.push(newBlock);
        console.log('添加新预览方块:', newBlock.number);
    }
    console.log('当前预览队列:', gameState.nextBlocks.map(block => block.number).join(', '));
}

// 创建并添加一个新的下落方块
function createFallingBlock(col) {
    // 如果游戏已暂停或已结束，不创建新方块
    if (!gameState.isGameRunning || gameState.isPaused) {
        return;
    }
    
    // 如果当前已有下落方块，不创建新方块
    if (gameState.fallingBlock) {
        return;
    }
    
    // 检查预览队列是否有足够的方块
    if (gameState.nextBlocks.length === 0) {
        console.error('预览队列为空，重新生成预览方块');
        generateNextBlocks();
    }
    
    // 从预览队列中取出第一个方块
    const nextBlock = gameState.nextBlocks.shift();
    console.log('使用预览方块:', nextBlock.number, '剩余预览方块:', gameState.nextBlocks.map(b => b.number).join(', '));
    
    const number = nextBlock.number;
    const color = nextBlock.color;
    
    // 创建新的下落方块
    const block = createBlock(col, -1, number, color);
    block.isFalling = true;
    
    // 设置下落速度（根据是否是自动下落）
    block.speed = gameState.isAutoFalling ? AUTO_FALLING_SPEED : FALLING_SPEED;
    
    gameState.blocks.push(block);
    gameState.fallingBlock = block;
    
    // 添加新的方块到预览队列
    generateNextBlocks();
    
    // 重新绘制预览方块
    drawNextBlocks();
}

// 绘制单个方块
function drawBlock(block, ctx, size = CELL_SIZE) {
    const x = block.x;
    const y = block.y;
    
    // 绘制方块背景
    ctx.fillStyle = block.color;
    ctx.fillRect(x, y, size, size);
    
    // 绘制方块边框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
    
    // 绘制方块中的数字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.number.toString(), x + size / 2, y + size / 2);
}

// 绘制即将掉落的方块
function drawNextBlocks() {
    // 检查预览方块队列是否为空
    if (gameState.nextBlocks.length === 0) {
        console.error('预览方块队列为空!');
        return;
    }
    
    // 清除画布
    nextBlocksCtx.clearRect(0, 0, nextBlocksCanvas.width, nextBlocksCanvas.height);
    
    // 绘制背景
    nextBlocksCtx.fillStyle = '#f0f0f0';
    nextBlocksCtx.fillRect(0, 0, nextBlocksCanvas.width, nextBlocksCanvas.height);
    
    // 绘制标题和边框
    nextBlocksCtx.strokeStyle = '#2196F3';
    nextBlocksCtx.lineWidth = 2;
    nextBlocksCtx.strokeRect(2, 2, nextBlocksCanvas.width - 4, nextBlocksCanvas.height - 4);
    
    // 计算方块间距和起始位置
    const spacing = 15;
    const blockSize = 45; // 稍微小一点的方块
    const startX = 15;
    const startY = (nextBlocksCanvas.height - blockSize) / 2;
    
    // 获取下一个要掉落的方块（队列中的第一个）
    const nextBlock = gameState.nextBlocks[0];
    console.log('下一个掉落的方块:', nextBlock.number);
    
    // 绘制"下一个"文本标签
    nextBlocksCtx.fillStyle = '#2196F3';
    nextBlocksCtx.font = 'bold 12px Arial';
    nextBlocksCtx.textAlign = 'center';
    nextBlocksCtx.fillText('下一个', startX + blockSize/2, startY - 8);
    
    // 绘制下一个方块的高亮框
    nextBlocksCtx.strokeStyle = '#FF9800';
    nextBlocksCtx.lineWidth = 3;
    nextBlocksCtx.strokeRect(startX - 2, startY - 2, blockSize + 4, blockSize + 4);
    
    // 绘制下一个方块
    const nextTempBlock = {
        x: startX,
        y: startY,
        number: nextBlock.number,
        color: nextBlock.color
    };
    drawBlock(nextTempBlock, nextBlocksCtx, blockSize);
    
    // 绘制后续方块
    nextBlocksCtx.fillStyle = '#999';
    nextBlocksCtx.font = '11px Arial';
    nextBlocksCtx.textAlign = 'center';
    nextBlocksCtx.fillText('后续方块', startX + blockSize + spacing + blockSize/2, startY - 8);
    
    // 绘制箭头
    const arrowX = startX + blockSize + 5;
    const arrowY = startY + blockSize/2;
    nextBlocksCtx.fillStyle = '#666';
    nextBlocksCtx.beginPath();
    nextBlocksCtx.moveTo(arrowX, arrowY);
    nextBlocksCtx.lineTo(arrowX + spacing - 10, arrowY - 5);
    nextBlocksCtx.lineTo(arrowX + spacing - 10, arrowY + 5);
    nextBlocksCtx.fill();
    
    // 分组显示后续的两个方块
    const groupX = startX + blockSize + spacing;
    const smallBlockSize = 30; // 后续方块更小
    const smallSpacing = 5;
    
    // 绘制第二个方块（如果存在）
    if (gameState.nextBlocks.length > 1) {
        const block2 = gameState.nextBlocks[1];
        const tempBlock2 = {
            x: groupX,
            y: startY,
            number: block2.number,
            color: block2.color
        };
        drawBlock(tempBlock2, nextBlocksCtx, smallBlockSize);
    }
    
    // 绘制第三个方块（如果存在）
    if (gameState.nextBlocks.length > 2) {
        const block3 = gameState.nextBlocks[2];
        const tempBlock3 = {
            x: groupX,
            y: startY + smallBlockSize + smallSpacing,
            number: block3.number,
            color: block3.color
        };
        drawBlock(tempBlock3, nextBlocksCtx, smallBlockSize);
    }
    
    // 添加顺序提示文本
    nextBlocksCtx.fillStyle = '#666';
    nextBlocksCtx.font = '9px Arial';
    nextBlocksCtx.textAlign = 'right';
    nextBlocksCtx.fillText('掉落顺序', nextBlocksCanvas.width - 10, nextBlocksCanvas.height - 5);
}

// 绘制网格
function drawGrid() {
    // 绘制网格背景
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(
        GRID_OFFSET_X, 
        GRID_OFFSET_Y, 
        GRID_COLS * CELL_SIZE, 
        GRID_ROWS * CELL_SIZE
    );
    
    // 绘制网格线
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let i = 0; i <= GRID_COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(GRID_OFFSET_X + i * CELL_SIZE, GRID_OFFSET_Y);
        ctx.lineTo(GRID_OFFSET_X + i * CELL_SIZE, GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 0; i <= GRID_ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(GRID_OFFSET_X, GRID_OFFSET_Y + i * CELL_SIZE);
        ctx.lineTo(GRID_OFFSET_X + GRID_COLS * CELL_SIZE, GRID_OFFSET_Y + i * CELL_SIZE);
        ctx.stroke();
    }
}

// 绘制游戏状态
function drawGame() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制所有方块
    gameState.blocks.forEach(block => drawBlock(block, ctx));
    
    // 如果游戏暂停，显示暂停文本
    if (gameState.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 检查方块匹配
function checkForMatch(block) {
    const row = block.row;
    const col = block.col;
    const number = block.number;
    
    // 检查四个方向
    const directions = [
        [-1, 0], // 上
        [1, 0],  // 下
        [0, -1], // 左
        [0, 1]   // 右
    ];
    
    let matched = false;
    let matchedPositions = []; // 记录消除的位置
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // 检查边界
        if (newRow >= 0 && newRow < GRID_ROWS && newCol >= 0 && newCol < GRID_COLS) {
            const adjacentBlock = gameState.grid[newRow][newCol];
            
            // 如果有相邻方块，且两数之和为10
            if (adjacentBlock && adjacentBlock.number + number === 10) {
                // 记录消除的位置
                matchedPositions.push({row, col});
                matchedPositions.push({row: newRow, col: newCol});
                
                // 从网格和方块列表中移除这两个方块
                gameState.grid[row][col] = null;
                gameState.grid[newRow][newCol] = null;
                
                const blockIndex = gameState.blocks.indexOf(block);
                if (blockIndex !== -1) {
                    gameState.blocks.splice(blockIndex, 1);
                }
                
                const adjacentIndex = gameState.blocks.indexOf(adjacentBlock);
                if (adjacentIndex !== -1) {
                    gameState.blocks.splice(adjacentIndex, 1);
                }
                
                // 增加分数
                gameState.score += 10;
                updateScoreDisplay();
                
                // 每100分升一级
                if (gameState.score % 100 === 0) {
                    gameState.level += 1;
                    updateLevelDisplay();
                }
                
                matched = true;
                
                // 找到匹配，退出循环
                break;
            }
        }
    }
    
    // 如果发生了消除，处理上方方块的下降
    if (matched) {
        console.log("发生消除，处理上方方块下降");
        // 延迟一小段时间后处理，以便玩家可以看到消除效果
        setTimeout(() => {
            handleBlocksFalling(matchedPositions);
        }, 200);
    }
    
    return matched;
}

// 处理方块消除后上方方块的下降
function handleBlocksFalling(positions) {
    // 按列分组处理
    const colsToProcess = new Set();
    positions.forEach(pos => colsToProcess.add(pos.col));
    
    // 记录下降的方块，以便后续检查是否可以再次消除
    const movedBlocks = [];
    
    // 处理每一列
    colsToProcess.forEach(col => {
        // 从底部开始向上检查
        for (let row = GRID_ROWS - 1; row >= 0; row--) {
            // 如果当前位置为空
            if (gameState.grid[row][col] === null) {
                // 寻找上方最近的方块
                let foundRow = -1;
                for (let r = row - 1; r >= 0; r--) {
                    if (gameState.grid[r][col] !== null) {
                        foundRow = r;
                        break;
                    }
                }
                
                // 如果找到了上方的方块，将其下移
                if (foundRow !== -1) {
                    const blockToMove = gameState.grid[foundRow][col];
                    
                    // 更新方块的行号和位置
                    blockToMove.row = row;
                    blockToMove.y = GRID_OFFSET_Y + row * CELL_SIZE;
                    
                    // 更新网格状态
                    gameState.grid[row][col] = blockToMove;
                    gameState.grid[foundRow][col] = null;
                    
                    // 记录移动的方块
                    movedBlocks.push(blockToMove);
                    
                    console.log(`方块从(${foundRow},${col})移动到(${row},${col})`);
                }
            }
        }
    });
    
    // 绘制更新后的游戏状态
    drawGame();
    
    // 检查移动后的方块是否可以继续消除
    let hasMatched = false;
    for (const block of movedBlocks) {
        const matched = checkForMatch(block);
        if (matched) {
            hasMatched = true;
            // 一旦发现一个匹配，就不继续检查了，因为位置已经改变
            break;
        }
    }
    
    // 如果没有再次消除，检查游戏是否结束
    if (!hasMatched) {
        checkGameOver();
        
        // 没有游戏结束，开始下一个自动下落
        if (gameState.isGameRunning) {
            startAutoFalling();
        }
    }
}

// 检查游戏是否结束
function checkGameOver() {
    // 如果最顶行有非空方块，游戏结束
    for (let col = 0; col < GRID_COLS; col++) {
        if (gameState.grid[0][col] !== null) {
            gameOver();
            return;
        }
    }
}

// 游戏结束处理
function gameOver() {
    gameState.isGameRunning = false;
    
    // 绘制游戏结束界面
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText(`最终得分: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('点击"重新开始"按钮再玩一次', canvas.width / 2, canvas.height / 2 + 60);
    
    console.log('游戏结束，得分:', gameState.score);
}

// 更新方块位置
function updateBlocks() {
    if (gameState.fallingBlock) {
        // 更新下落方块的位置
        // 使用方块自身的速度，可能是标准速度或自动下落速度
        gameState.fallingBlock.y += gameState.fallingBlock.speed || FALLING_SPEED;
        
        // 计算当前所在的行
        const currentRow = Math.floor((gameState.fallingBlock.y - GRID_OFFSET_Y) / CELL_SIZE);
        const col = gameState.fallingBlock.col;
        
        // 检查是否碰到底部或其他方块
        if (currentRow >= 0 && (
            currentRow >= GRID_ROWS - 1 || 
            (currentRow + 1 < GRID_ROWS && gameState.grid[currentRow + 1][col] !== null)
        )) {
            // 方块停止下落
            gameState.fallingBlock.isFalling = false;
            gameState.fallingBlock.row = currentRow;
            gameState.fallingBlock.y = GRID_OFFSET_Y + currentRow * CELL_SIZE;
            
            // 更新网格状态
            gameState.grid[currentRow][col] = gameState.fallingBlock;
            
            // 检查是否可以消除
            const matched = checkForMatch(gameState.fallingBlock);
            
            // 清除当前下落方块
            gameState.fallingBlock = null;
            
            // 如果没有发生消除，立即开始下一个方块的自动下落
            // 如果发生了消除，会在消除和下降处理完成后再考虑自动下落
            if (!matched) {
                startAutoFalling();
            }
        }
    }
}

// 开始自动下落
function startAutoFalling() {
    // 只有在游戏运行且没有当前下落方块时才开始自动下落
    if (!gameState.isGameRunning || gameState.isPaused || gameState.fallingBlock) {
        return;
    }
    
    console.log('开始自动下落倒计时');
    
    // 设置一个延迟，然后开始自动下落
    gameState.autoDropTimeout = setTimeout(() => {
        gameState.isAutoFalling = true;
        
        // 随机选择一列或使用中间列
        const randomCol = Math.floor(GRID_COLS / 2);
        
        console.log('自动下落开始，选择列:', randomCol);
        createFallingBlock(randomCol);
    }, AUTO_DROP_DELAY);
}

// 处理鼠标点击事件
function handleClick(event) {
    if (!gameState.isGameRunning || gameState.isPaused) {
        return;
    }
    
    // 获取鼠标点击位置
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 计算点击的列
    const col = Math.floor((x - GRID_OFFSET_X) / CELL_SIZE);
    
    // 检查点击是否在网格范围内
    if (col >= 0 && col < GRID_COLS && 
        y >= GRID_OFFSET_Y && 
        y <= GRID_OFFSET_Y + GRID_ROWS * CELL_SIZE) {
        
        // 如果已经有方块在下落，改变其列位置
        if (gameState.fallingBlock) {
            // 先检查新位置是否合法（没有其他方块阻挡）
            const row = gameState.fallingBlock.row;
            if (row < 0 || gameState.grid[0][col] === null) {
                gameState.fallingBlock.col = col;
                gameState.fallingBlock.x = GRID_OFFSET_X + col * CELL_SIZE;
                
                // 如果是自动下落，改为玩家控制的下落速度
                if (gameState.isAutoFalling) {
                    gameState.isAutoFalling = false;
                    gameState.fallingBlock.speed = FALLING_SPEED;
                }
            }
        } else {
            // 如果有自动下落计时器，取消它
            if (gameState.autoDropTimeout) {
                clearTimeout(gameState.autoDropTimeout);
                gameState.autoDropTimeout = null;
            }
            
            // 没有方块下落时，创建新的下落方块
            gameState.isAutoFalling = false;
            createFallingBlock(col);
        }
    }
}

// 游戏循环
function gameLoop() {
    if (gameState.isGameRunning && !gameState.isPaused) {
        updateBlocks();
        drawGame();
    }
    
    gameState.animationId = requestAnimationFrame(gameLoop);
}

// 开始游戏
function startGame() {
    console.log('开始游戏函数被调用');
    if (!gameState.isGameRunning) {
        initGame();
        gameState.isGameRunning = true;
        gameState.isPaused = false;
        gameLoop();
        
        // 游戏开始后延迟一段时间开始自动下落
        setTimeout(() => {
            startAutoFalling();
        }, 500);
        
        console.log('游戏已启动，状态:', gameState);
    }
}

// 暂停/继续游戏
function togglePause() {
    if (gameState.isGameRunning) {
        gameState.isPaused = !gameState.isPaused;
        
        // 如果暂停游戏，清除自动下落计时器
        if (gameState.isPaused && gameState.autoDropTimeout) {
            clearTimeout(gameState.autoDropTimeout);
            gameState.autoDropTimeout = null;
        } 
        // 如果继续游戏且没有下落方块，开始自动下落
        else if (!gameState.isPaused && !gameState.fallingBlock) {
            startAutoFalling();
        }
        
        drawGame();
    }
}

// 重新开始游戏
function restartGame() {
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    startGame();
}

// 等待页面完全加载后初始化游戏控件
window.addEventListener('load', function() {
    console.log('页面完全加载完成，初始化游戏控件');
    
    // 绑定事件处理程序
    canvas.addEventListener('click', handleClick);
    
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    
    // 添加错误处理
    if (!startButton || !pauseButton || !restartButton) {
        console.error('找不到游戏控制按钮!', { 
            startButton, 
            pauseButton, 
            restartButton 
        });
    } else {
        // 只有在按钮存在时才添加事件监听器
        startButton.addEventListener('click', function(e) {
            console.log('点击了开始按钮');
            e.preventDefault(); // 防止默认行为
            startGame();
        });
        
        pauseButton.addEventListener('click', function(e) {
            console.log('点击了暂停按钮');
            e.preventDefault(); // 防止默认行为
            togglePause();
        });
        
        restartButton.addEventListener('click', function(e) {
            console.log('点击了重新开始按钮');
            e.preventDefault(); // 防止默认行为
            restartGame();
        });
    }

    // 初始化游戏
    initGame();
    console.log('游戏初始化完成');
}); 