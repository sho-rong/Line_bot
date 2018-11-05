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

function memoRep(token){
    var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + access_token,
  };

  var postData = {
    "replyToken" : token,
    "messages" : [
      {
        "type":"template",
        "altText":"this is a memo template",
        "template":{
          "type":"buttons",
          "actions":[
            {
              "type":"message",
              "label":"メモリスト",
              "text": "mread"
            },
            {
              "type":"message",
              "label":"追加",
              "text": "madd"
            },
            /*
            {
              "type":"message",
              "label":"削除",
              "text": "mdelete"
            },
            */
            ],
            "thumbnailImageUrl":"https://i0.wp.com/tatomac.net/wp-content/uploads/2017/01/slooProImg_20170114190255.jpg?resize=500%2C500&ssl=1",
            "title":"メモ帳たんたん♪",
            "text":"やりたい操作を選んでね💫"
        }
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
      
/*
 * postされたときの処理
 */
function doPost(e) {
  var json = JSON.parse(e.postData.contents);
  var data = json.events;
  var replyToken = json.events[0].replyToken;
  var messageReceive = json.events[0].message.text;
  var messageSend="";
  var usrID=json.events[0].source.userId;
  var memoMode=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).getValue();
  var memoColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,1).getValue();
  var date = new Date();
  var usrNum=getUsrNum(usrID);
  log(data);
    
    
  if(memoMode==1){
    insertMemoList(usrNum,messageReceive);
    setMemoMode(0);
    reply(replyToken,"追加したぞい🌟");
    return;
  }
  
  switch(messageReceive){
    case "memo":
    case "メモ":
      memoRep(replyToken);
      return;
    case "mread":
      var memoList=getMemoList(usrNum);
      reply(replyToken,memoList);
      return;
    case "madd":
      setMemoMode(1);
      reply(replyToken,"はーい、メモする内容を記入するたんたん");
    　　　　return;
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
      messageSend= messageReceive+"たんたん";
      break;
  }
  
  reply(replyToken,messageSend);  
}

function insertMemoList(id,msg){
    insertDB(memoDB,"(ID_num,memo)","("+id+",'"+msg+"')");
    
}

function getUsrNum(id){
  var usrNum= Number(selectDB(profileDB,"ID_num","where ID ='"+ id+"'").toString());
  return usrNum;
} 
  
function getMemoList(id_num){
  var temp=selectDB(memoDB,"memo","where ID_num ="+id_num);
  var temp2="";
  for(var i=0;i<temp.length;i++){
      temp2=temp2+temp[i][0]+"\n";
      }
  temp2=temp2.slice(0,-1);
  return temp2;
}
  
//log
function log(data){
  var logColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).getValue();
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log').getRange(logColumn,1).setValue(data);
  logColumn++;
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).setValue(logColumn);
}

function setMemoMode(num){
  //0:false, 1:add 2,delete
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
    case 2://火曜
      msg='おす、おら孫悟空！ 火曜日は俺の出番だぜ！ 今日も1日頑張ろうな！！'
    case 3://水曜
      msg='Good Morning. You look so wonderful today! Hoping you have a good day^^'
    default:
      msg='おっはよーー';
      break;
  }
  var pushTo = selectDB(profileDB,"ID","where ID_num=1").toString();
  push("メモって打ってみるといいどん\nでもまだまだ開発中だどん\nバグがあったら教えて欲しいどん♪",pushTo);
}

function messageForALL(){
  var User = selectDB(profileDB,"ID","").toString();
  for(var i=0;i<User.length;i++){
    push("",User[i][0]);
  }  
}