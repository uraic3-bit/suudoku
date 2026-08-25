/** 1セルのサイズ(px) */
const panelSize = Object.freeze({
    /** 幅*/
    width:50,
    /** 高さ*/
    height:50
});

/** 難易度 */
const gameMode = Object.freeze({
    /** 初級*/
    easy:35,
    /** 中級*/
    normal:30,
    /** 上級*/
    hard:25
});

/** 数値設定ボタン **/
const NumberSelection = Object.freeze({
    zero:0,
    one:1,
    two:2,
    three:3,
    four:4,
    five:5,
    six:6,
    seven:7,
    eight:8,
    nine:9,
    none:""
});

/** カーソル操作ボタン */
const CursorSelection = Object.freeze({
    up:"up",
    down:"down",
    left:"left",
    right:"right"
});

/**
 * 座標クラス
 **/
class Point{
    /**
     * @param {number} x x座標 
     * @param {number} y y座標
     */
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

/** パネルクラス**/
class Panel{
    /** 
     * @param {Point} pointStart    パネルの開始座標
     * @param {Point} pointEnd      パネルの終了座標
     * @param {number} groupRange   範囲グループの番号
     * @param {number} groupVirtical     縦グループの番号
     * @param {number} groupHorizonal   横部ループの番号
     * @param {number} correctValue     正解値
     * @param {number} inputValue       選択値
     * @param {number} upperPanelNumber 上のパネル番号
     * @param {number} rightPanelNumber 右のパネル番号
     * @param {number} leftPanelNumber  左のパネル番号
     * @param {number} lowerPanelNumber 下のパネル番号
     * @param {boolean} onCursor        カーソル設定フラグ
     * @param {boolean} defaultOpen     デフォルトパネルオープンフラグ
     * @param {boolean} isOpen          パネルオープンフラグ
     * @param {number} panelNumber     パネル番号
     */
    constructor(
        pointStart,pointEnd,groupRange,groupVirtical,groupHorizonal,correctValue,inputValue,
        upperPanelNumber,rightPanelNumber,leftPanelNumber,lowerPanelNumber,onCursor,defaultOpen,isOpen,panelNumber){
        this.pointStart = pointStart;
        this.pointEnd = pointEnd;
        this.groupRange = groupRange;
        this.groupVirtical = groupVirtical;
        this.groupHorizonal = groupHorizonal;
        this.correctValue = correctValue;
        this.inputValue = inputValue;
        this.upperPanelNumber = upperPanelNumber;
        this.rightPanelNumber = rightPanelNumber;
        this.leftPanelNumber = leftPanelNumber;
        this.lowerPanelNumber = lowerPanelNumber;
        this.onCursor = onCursor;
        this.defaultOpen = defaultOpen;
        this.isOpen = isOpen;
        this.panelNumber = panelNumber;
    }
}

/**
 * デフォルトオープンパネル配列取得
 */
function getDefaultOpenNumberArray(openCount){
    const randomArray = Array.from({length:81},(v,i)=>i);
    let returnArray = [];
    for(let i=0;i<openCount;i++){
        returnArray = returnArray.concat(randomArray.splice(Math.floor(Math.random() * randomArray.length),1));
    }
    return returnArray;
}

/**
     @param {gameMode} mode
    */
function setPanel(mode){
    //デフォルトオープンパネル配列取得
    const openNumbers = getDefaultOpenNumberArray(mode);

    //パネル配置
    for (let i = 1; i <= 9; i++) {
        randomArray = [1,2,3,4,5,6,7,8,9];

        for (let j = 1; j <= 9; j++) {
            let startX = (i-1)*panelSize.width;
            let startY = (j-1)*panelSize.height;
            let groupRangeNumber = 1 + Math.floor((i-1)/3) + Math.floor((j-1)/3)*3;
            let groupVirticalNumber = i;
            let groupHorizonalNumber = j;
            let continuationFlg = true;
            let workRandomArray = randomArray.slice();
            

            while(continuationFlg){
                randomNumber = Math.floor(Math.random() * workRandomArray.length);
                if(checkGroup(workRandomArray[randomNumber],groupRangeNumber,groupVirticalNumber,groupHorizonalNumber)) {
                    continuationFlg = false;
                    correctNumber = workRandomArray[randomNumber];
                    randomArray.forEach((value,index,array)=>{
                        if(value === correctNumber){
                            array.splice(index,1);
                        }
                    })
                } else {
                    workRandomArray.splice(randomNumber,1);
                    if (workRandomArray.length ===0){
                        randomArray = [1,2,3,4,5,6,7,8,9];
                        panelMap.clear();
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        setPanel(mode);
                        return;
                    }
                }
                
            }

            panelMap.set(j+(i-1)*9, new Panel(
                new Point(startX, startY),
                new Point(startX + panelSize.width,startY + panelSize.height),
                groupRangeNumber,
                groupVirticalNumber,
                groupHorizonalNumber,
                correctNumber,
                null,
                null,
                null,
                null,
                null,
                null,
                openNumbers.includes(j+(i-1)*9-1),
                false,
                j+(i-1)*9
            ));
            //ライン描画（内枠）
            ctx.strokeStyle = "gray";
            ctx.lineWidth = 4;
            ctx.strokeRect(startX,startY,panelSize.width,panelSize.height);
        }
    }
    
    //ライン描画（外枠）
    for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 4;
            ctx.strokeRect((i-1)*panelSize.width*3,(j-1)*panelSize.height*3,panelSize.width*3,panelSize.height*3);
        }
    }
    //カーソル設定
    panelMap.get(1).onCursor=true;
    panelUpdate();

    //メッセージ更新
    let msg;
    switch(mode){
        case gameMode.easy:
            msg = "レベル：初級";
            break;
        case gameMode.normal:
            msg = "レベル：中級";
            break;
        case gameMode.hard:
            msg = "レベル：上級";
            break;
        default:
            msg = "";
            break;
    };
    
    $("#message").text(msg);
}

/** グループに該当の数字が存在しないことを確認する 
 * @param {number} checkNumber
 * @returns {boolean} グループに追加可能な場合:true、グループに追加不可:false
*/
function checkGroup(checkNum,grNum,gvNum,ghNum){
    for(const val of panelMap.values()){
        if (val.correctValue === checkNum && 
        (grNum === val.groupRange || gvNum === val.groupVirtical || ghNum === val.groupHorizonal)) {
            return false; // 条件一致で即座に false を返して終了
        }
    }
    return true;
}

/** 完了かチェックする
 *　@returns{boolean} - true：完了、false：未完了
    */
function CompleteCheck(){
    /** @type{Panel} val */ 
    return Array.from(panelMap.values()).every((val)=>{
        return val.defaultOpen || val.inputValue != null;
    }) 

}

/** パネルに番号を設定
 * @param {NumberSelection} num
 **/
function setNumber(num){
    /** @type{Panel} pnl **/
    panelMap.forEach((pnl,key)=>{
        if(pnl.onCursor && !pnl.defaultOpen){
            pnl.inputValue = num;
            //完了チェックし、パネル更新
            panelUpdate(CompleteCheck());
        }
    })
}

/** カーソル移動 **/
function moveCursor(keyWord){
    //現在位置を取得
    const nowPointNumber = Array.from(panelMap.values())
                .filter(val => val.onCursor);
    const targetNumber = nowPointNumber[0].panelNumber;

    switch (keyWord) {
        case CursorSelection.up:
            if(targetNumber % 9 !== 1){
                panelMap.get(targetNumber).onCursor = false;
                panelMap.get(targetNumber-1).onCursor = true;
                panelUpdate();
            }
            break;
        case CursorSelection.down:
            if(targetNumber % 9 !== 0){
                panelMap.get(targetNumber).onCursor = false;
                panelMap.get(targetNumber+1).onCursor = true;
                panelUpdate();
            }
            break;
        case CursorSelection.left:
            if(targetNumber > 9){
                panelMap.get(targetNumber).onCursor = false;
                panelMap.get(targetNumber-9).onCursor = true;
                panelUpdate();
            }
            break;
        case CursorSelection.right:
            if(targetNumber < 73){
                panelMap.get(targetNumber).onCursor = false;
                panelMap.get(targetNumber+9).onCursor = true;
                panelUpdate();
            }
            break;
        }
}

/** パネル更新
 * @param {boolean} [completeFlg=false] 完了フラグ：trueの場合、答え合わせ
 * */
function panelUpdate(completeFlg=false){
    if(completeFlg) {
        //完了
        let retMsg = "CONGRATULATION!";

        /** @type{Panel}pnl */
        panelMap.forEach((pnl,key)=>{
            if(pnl.defaultOpen) {
                //デフォルト
                ctx.fillStyle = "lightblue";
                ctx.fillRect(pnl.pointStart.x+2,pnl.pointStart.y+2,panelSize.width-4,panelSize.height-4);
                ctx.fillStyle ="black";
                ctx.font = "30px sans-serif";
                ctx.fillText(pnl.correctValue, pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
            } else if(pnl.inputValue != null && pnl.inputValue == pnl.correctValue){
                //正解
                ctx.fillStyle = "white";
                ctx.fillRect(pnl.pointStart.x+2,pnl.pointStart.y+2,panelSize.width-4,panelSize.height-4);
                ctx.fillStyle ="black";
                ctx.font = "30px sans-serif";
                ctx.fillText(pnl.correctValue, pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.font = "bold 60px 'MS Gothic'";
                ctx.fillText("〇", pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
                
            } else {
                //不正解
                ctx.fillStyle = "white";
                ctx.fillRect(pnl.pointStart.x+2,pnl.pointStart.y+2,panelSize.width-4,panelSize.height-4);
                ctx.fillStyle ="black";
                ctx.font = "30px sans-serif";
                ctx.fillText(pnl.correctValue, pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.font = "bold 60px 'MS Gothic'";
                ctx.fillText("×", pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
                retMsg = "GAME OVER";
            }})
            //メッセージ設定
            $("#message").text(retMsg);
            //操作非活性
            panelMap = new Map();

    } else {
        //未完了
        /** @type{Panel} */
        panelMap.forEach((pnl,key)=>{

            //パネル色決め
            if(pnl.onCursor){
                ctx.fillStyle = "blue";
            } else if(pnl.defaultOpen) { 
                ctx.fillStyle = "lightblue";
            } else {
                ctx.fillStyle = "white";
            };
            //パネル色塗り
            ctx.fillRect(pnl.pointStart.x+2,pnl.pointStart.y+2,panelSize.width-4,panelSize.height-4);

            //文字設定
            if(pnl.defaultOpen) {
                ctx.fillStyle ="black";
                ctx.font = "30px sans-serif";
                ctx.fillText(pnl.correctValue, pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
            } else if(pnl.inputValue !== null) {
                ctx.fillStyle ="black";
                ctx.font = "30px sans-serif";
                ctx.fillText(pnl.inputValue, pnl.pointStart.x + panelSize.width/2, pnl.pointStart.y + panelSize.height/2); 
            }
        })
    }
}

//画面項目が有効な状態かチェックする
function itemActiveCheck(){
    //NULLまたはundefined
    if(panelMap == null || panelMap.size !== 81){
        return false;
    }
    return true;
}


let canvas = null;
/** ＠type {CanvasRect} */ 
let ctx = null;
let canvasOffset = null;
let canvasX = null;
let canvasY = null;
let randomNumber = 0;
/** @type{Map} */
let panelMap = new Map();
let randomArray = null;
let correctNumber = null;

$(function(){
    //キャンバス作成
    canvas = $('#gameCanvas')[0];
    /** ＠type {CanvasRect} */ 
    ctx = canvas.getContext("2d");
    canvasOffset = $('#gameCanvas').offset();
    canvasX = canvasOffset.left; // ページ左端からの距離 (X座標)
    canvasY = canvasOffset.top;  // ページ上端からの距離 (Y座標)
    ctx.font = "30px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    //イベントハンドラー
    $("#easy").bind("click",function(){setPanel(gameMode.easy);});
    $("#normal").bind("click",function(){setPanel(gameMode.normal);});
    $("#hard").bind("click",function(){setPanel(gameMode.hard);});
    $("#answer").bind("click",function(){itemActiveCheck() && panelUpdate(true)});
    $("#up").bind("click",function(){itemActiveCheck() && moveCursor(CursorSelection.up)});
    $("#down").bind("click",function(){itemActiveCheck() && moveCursor(CursorSelection.down)});
    $("#left").bind("click",function(){itemActiveCheck() && moveCursor(CursorSelection.left)});
    $("#right").bind("click",function(){itemActiveCheck() && moveCursor(CursorSelection.right)});
    $("#one").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.one);});
    $("#two").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.two);});
    $("#three").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.three);});
    $("#four").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.four);});
    $("#five").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.five);});
    $("#six").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.six);});
    $("#seven").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.seven);});
    $("#eight").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.eight);});
    $("#nine").bind("click",function(){itemActiveCheck() && setNumber(NumberSelection.nine);});
    $("#zero").bind("click",function(){itemActiveCheck() && setNumber(null);});
    $(window).on("keydown",(event) => {
            event.preventDefault();
        switch (event.key){
            case "ArrowUp":
                itemActiveCheck() && moveCursor(CursorSelection.up);
                break;
            case "ArrowDown":
                itemActiveCheck() && moveCursor(CursorSelection.down);
                break;
            case "ArrowLeft":
                itemActiveCheck() && moveCursor(CursorSelection.left);
                break;
            case "ArrowRight":
                itemActiveCheck() && moveCursor(CursorSelection.right);
                break;
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                itemActiveCheck() && setNumber(event.key);
                break;
            case "0":
                itemActiveCheck() && setNumber(null);
                break;
        }});

    //マウス左クリック
    $(document).on("mousedown",(event) => {
        if (itemActiveCheck() && event.which === 1) {
            var checkPointX = event.pageX - canvasX;
            var checkPointY = event.pageY - canvasY;

            //キャンバスの範囲内であれば処理実施
            if(checkPointX >=0 && checkPointX <= panelSize.width*9 &&
                checkPointY >=0 && checkPointY <= panelSize.height*9
            ) {

                    /** @type{Panel}val */
                    panelMap.forEach(val =>{
                        if( checkPointX >= val.pointStart.x && 
                            checkPointX < val.pointEnd.x && 
                            checkPointY >= val.pointStart.y &&
                            checkPointY < val.pointEnd.y) {
                            val.onCursor = true;
                        } else {
                            val.onCursor = false;
                        }}
                    );
                    panelUpdate();
                }
        }
    })
});



