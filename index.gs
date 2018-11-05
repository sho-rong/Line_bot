// line developersに書いてあるChannel Access Token
var access_token = "gCjz7rdS4acOP03bBTXTg4+0ehR98xcfjPZgdRdaqu6/SUZNciEImKJcsq708qRUv2btxs0idBYl0sdjVQtZhbSDeVgxL3olr1qkoTyZvAJQl2XOSeF7vUMvaro/Nwd6dTtGTNG5f2zjH/i2xPw1IwdB04t89/1O/w1cDnyilFU="
// postされたログを残すスプレッドシートのid
var spreadsheet_id = "1tSMYNPh3gapK84ZCHe81Rnx4oCUkEqXXUR3OH7IB69g"
var replyUrl = "https://api.line.me/v2/bot/message/reply";
var pushUrl = "https://api.line.me/v2/bot/message/push";
/**
 * 指定のuser_idにpushをする
 */
function push(text,to) {
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + access_token,
  };
 
  var postData = {
    "to" : to,
    "messages" : [
      {
        'type':'text',
        'text':text,
      }
    ]
  };
 
  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };
 
  return UrlFetchApp.fetch(pushUrl, options);
}
 
/**
 * reply_tokenを使ってreplyする
 */
function reply(token,mes) {

  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + access_token,
  };

  var postData = {
    "replyToken" : token,
    "messages" : [
      {
        'type':'text',
        'text': mes,
      }
    ]
  };
 
  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };
 
  return UrlFetchApp.fetch(replyUrl, options);
}

/**
 * postされたときの処理
 */
function doPost(e) {
  var json = JSON.parse(e.postData.contents);
  var data = json.events;
  var replyToken = json.events[0].replyToken;
  var messageReceive = json.events[0].message.text;
  var messageSend;
  var memoMode=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).getValue();
  var memoColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,1).getValue();
  log(data);
  
  if(memoMode==1){
    SpreadsheetApp.openById(spreadsheet_id).getSheetByName('memo').getRange(memoColumn,1).setValue(messageReceive);
    setMemoMode(0);
    memoColumn++;
    SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,1).setValue(memoColumn);
    messageSend="登録完了♪";
  }else if(messageReceive=="memo-r"){
    var temp="";
    for(var i=1; i<memoColumn; i++){
      temp =temp+i.toString()+SpreadsheetApp.openById(spreadsheet_id).getSheetByName('memo').getRange(i,1).getValue()+"\n";
    }
    messageSend=temp;
  }else if(messageReceive=="memo-w"){
    messageSend="ほーい、メモする内容を教えて";
    setMemoMode(1);
  }else{
  
    switch(messageReceive){
      case "三木谷":
        messageSend="うんこまーん♪";
        break;
      case "奥野":
        messageSend="留年無い内定野郎";
        break;
      case "tmnr":
        messageSend="うんこぺーすとものり";
        break;
      case "ケビン":
        messageSend="お前が自己啓発本読めや";
        break;
      default:
        messageSend=messageReceive+'たんたん';
        break;      
    }

  }
  
  reply(replyToken,messageSend);  
}

//log
function log(data){
  var logColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).getValue();
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log').getRange(logColumn,1).setValue(data);
  logColumn++;
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).setValue(logColumn);
}

function setMemoMode(num){
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).setValue(num);
}
/**
 * pushをしてみる
 */
function morningCall() {
  var date = new Date();
  var dayWeek = date.getDay();
  var meg='';
  switch(dayWeek){
    case 0://日曜
      msg='おはよう、今日は日曜日です。良い休日を^^';
      break;
    case 1://月曜
      msg='おはよう、今日は...月曜日ですね(´;ω;｀)　がーんばるぞい♪';
      break;
    default:
      msg='おっはよーー';
      break;
  }
  var pushTo = selectDB(profileDB,"ID","where name='Me'")
  push(msg,pushTo);
}















