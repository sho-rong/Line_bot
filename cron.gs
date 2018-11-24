var ALL = '*';
var LIMIT_MATCHES = {'minute': '[0-5]?[0-9]', 'hour': '[01]?[0-9]|2[0-3]', 'day': '0?[1-9]|[1-2][0-9]|3[01]', 'month': '0?[1-9]|1[0-2]', 'year': '2[0-9][2-9][0-9]|201[8-9]'};
var MAX_NUMBERS   = {'minute': 59, 'hour': 23, 'day': 31, 'month': 12, 'year':2999}; // 本物のcronは曜日の7を日曜と判定するが、手間なのでmax6とする
var COLUMNS       = ['minute', 'hour', 'day', 'month', 'year'];

function cronFunction() {
  console.log("cronFunc now");
  var cronList = getCronList(cronSheet);
  var currentTime = new Date();
  var times  = {
    'minute': Utilities.formatDate(currentTime, 'Asia/Tokyo', 'm'),
    'hour':   Utilities.formatDate(currentTime, 'Asia/Tokyo', 'H'),
    'day':    Utilities.formatDate(currentTime, 'Asia/Tokyo', 'd'),
    'month':  Utilities.formatDate(currentTime, 'Asia/Tokyo', 'M'),
    'year':   Utilities.formatDate(currentTime, 'Asia/Tokyo', 'y')
  };
  for (var i = 1; i < cronList.length; i++) { // スプレッドシートから取得した一行目(key:0)はラベルなので、key1から実行
    console.log("cronList:"+cronList[i]);
    executeIfNeeded(cronList[i], times, cronSheet, i + 1);
  }
}

// シートからCronの一覧を取得し配列で返す
function getCronList(sheet) {
  return sheet.getDataRange().getValues(); // 1行ずつ取得すると都度通信が走り重いので、一括で範囲内全てを取得する
}

// 実行すべきタイミングか判定し、必要であれば実行
function executeIfNeeded(cron, times, sheet, row) {
  if(cron[8]=="yes"){
    return;
  }
  for (var i in COLUMNS) { // minute, hour, day, month, yearを順番にチェックして全て条件にマッチするようならcron実行
    var timeType = COLUMNS[i];
    var timingList = getTimingList(cron[i], timeType);
    console.log(timingList);
    if (!isMatch(timingList, times[timeType])) {
      console.log("not match");
      return false;
    }
  }
  //sheet.getRange(row, 9).setValue(new Date()); // 最終リクエスト送信日時
  executeAction(cron,row,sheet);
}

// 中身が*もしくは指定した数字を含んでいるか
function isMatch(timingList, time) {
  return (timingList[0] === ALL || timingList.indexOf(time) !== -1);
}

// APIにgetリクエストを送る
function executeAction(cron,row,sheet) {
  var func_name = cron[5];
  console.log("Execute action:"+func_name);
  eval(func_name+"(cron,row,sheet)");
}

// 文字列から数字のリストを返す
function getTimingList(timingStr, type) {
  var timingList = [];
  if (timingStr == ALL) { // * の時はそのまま配列にして返す
    timingList.push(timingStr);
    return timingList;
  }
  
  timingStr=timingStr.toString();
  var limitPattern  = "(" + LIMIT_MATCHES[type] + ")";
  var numReg   = new RegExp("^" + limitPattern + "$");                      // 単一指定パターン ex) 2
  if (match = timingStr.match(numReg)) { // 単一指定パターンにマッチしたら配列に追加
    timingList.push(toStr(match[1]));
  } 
  return timingList;
}

// ifやforの判定を正しく行う為に文字列を10進数int型に変換
function toInt(num) {
  return parseInt(num, 10);
}
// 数値を10進数int型にして文字列に変換。実行タイミング一致判定（indexOf）で必要
function toStr(num) {
  return toInt(num).toFixed();
}