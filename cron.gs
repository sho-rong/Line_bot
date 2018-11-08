var ALL = '*';
var LIMIT_MATCHES = {'minute': '[0-5]?[0-9]', 'hour': '[01]?[0-9]|2[0-3]', 'day': '0?[1-9]|[1-2][0-9]|3[01]', 'month': '0?[1-9]|1[0-2]', 'week': '[0-6]'};
var MAX_NUMBERS   = {'minute': 59, 'hour': 23, 'day': 31, 'month': 12, 'week': 6}; // 本物のcronは曜日の7を日曜と判定するが、手間なのでmax6とする
var COLUMNS       = ['minute', 'hour', 'day', 'month', 'week'];
var spreadsheet_id = "1tSMYNPh3gapK84ZCHe81Rnx4oCUkEqXXUR3OH7IB69g"

function cronFunction() {
  var sheet = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron');
  var cronList = getCronList(sheet);
  var currentTime = new Date();
  var times  = {
    'minute': Utilities.formatDate(currentTime, 'Asia/Tokyo', 'm'),
    'hour':   Utilities.formatDate(currentTime, 'Asia/Tokyo', 'H'),
    'day':    Utilities.formatDate(currentTime, 'Asia/Tokyo', 'd'),
    'month':  Utilities.formatDate(currentTime, 'Asia/Tokyo', 'M'),
    'week':   Utilities.formatDate(currentTime, 'Asia/Tokyo', 'u')
  };
  for (var i = 1; i < cronList.length; i++) { // スプレッドシートから取得した一行目(key:0)はラベルなので、key1から実行
    executeIfNeeded(cronList[i], times, sheet, i + 1);
  }
}

// シートからCronの一覧を取得し配列で返す
function getCronList(sheet) {
  //var lastRow = sheet.getLastRow();
  //ほんとはgetRangeの3番目にlastRow
  return sheet.getRange(1, 1, 2, 6).getValues(); // 1行ずつ取得すると都度通信が走り重いので、一括で範囲内全てを取得する
}

// 実行すべきタイミングか判定し、必要であれば実行
function executeIfNeeded(cron, times, sheet, row) {
  Logger.log(cron);
  for (var i in COLUMNS) { // minute, hour, day, month, weekを順番にチェックして全て条件にマッチするようならcron実行
    var timeType = COLUMNS[i];
    var timingList = getTimingList(cron[i], timeType);
    //Logger.log(timingList);
    //Logger.log(times[timeType]);
    if (!isMatch(timingList, times[timeType])) {
      return false;
    }
  }
  sheet.getRange(row, 7).setValue(new Date()); // 最終リクエスト送信日時
  executeAction(cron);
}

// 中身が*もしくは指定した数字を含んでいるか
function isMatch(timingList, time) {
  return (timingList[0] === ALL || timingList.indexOf(time) !== -1);
}

// APIにgetリクエストを送る
function executeAction(cron) {
  var func_name = cron[5];
  //Logger.log(func_name);
  eval(func_name+"()");
}

// 文字列から数字のリストを返す
function getTimingList(timingStr, type) {
  var timingList = [];
  if (timingStr == ALL) { // * の時はそのまま配列にして返す
    timingList.push(timingStr);
    return timingList;
  }
  
  timingStr=timingStr.toString();
  //Logger.log(timingStr);

  var limitPattern  = "(" + LIMIT_MATCHES[type] + ")";
  var numReg   = new RegExp("^" + limitPattern + "$");                      // 単一指定パターン ex) 2
  var rangeReg = new RegExp("^" + limitPattern + "-" + limitPattern + "$"); // 範囲指定パターン ex) 1-5
  var devReg   = new RegExp("^\\*\/" + limitPattern + "$");                 // 間隔指定パターン ex) */10
  //var commaSeparatedList = timingStr.split(','); // 共存指定パターン ex) 1,3-5


  if (match = timingStr.match(numReg)) { // 単一指定パターンにマッチしたら配列に追加
    timingList.push(toStr(match[1]));
  } else if ((match = timingStr.match(rangeReg)) && toInt(match[1]) < toInt(match[2])) { // 範囲指定パターンにマッチしたら配列に追加
    for (var i = toInt(match[1]); i <= toInt(match[2]); i++) {
      timingList.push(toStr(i));
    }
  } else if ((match = timingStr.match(devReg)) && toInt(match[1]) <= MAX_NUMBERS[type]) { // 間隔指定パターンにマッチしたら配列に追加
    var start = (type == 'day' || type == 'month') ? 1 : 0; // 月と日だけ0が存在しないので1からカウントする
    for (var i = start; i <= MAX_NUMBERS[type] / match[1]; i++) {
      timingList.push(toStr(i * match[1]));
    }
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
