// line developersに書いてあるChannel Access Token
var access_token = "gCjz7rdS4acOP03bBTXTg4+0ehR98xcfjPZgdRdaqu6/SUZNciEImKJcsq708qRUv2btxs0idBYl0sdjVQtZhbSDeVgxL3olr1qkoTyZvAJQl2XOSeF7vUMvaro/Nwd6dTtGTNG5f2zjH/i2xPw1IwdB04t89/1O/w1cDnyilFU="
// postされたログを残すスプレッドシートのid
var spreadsheet_id = "1tSMYNPh3gapK84ZCHe81Rnx4oCUkEqXXUR3OH7IB69g"
var replyUrl = "https://api.line.me/v2/bot/message/reply";
var pushUrl = "https://api.line.me/v2/bot/message/push";
var date=new Date();
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
 
  send_log(options);
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
 
  send_log(options)
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
              "text": "メモリスト"
            },
            {
              "type":"message",
              "label":"追加",
              "text": "追加"
            },
            {
              "type":"message",
              "label":"削除",
              "text": "削除"
            },
            {
              "type":"message",
              "label":"リマインド",
              "text": "リマインド"
            },            
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
 
  send_log(options);    
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
  
  if(memoMode==2){
    setMemoMode(0);
    deleteMemoList(usrNum,messageReceive);
    reply(replyToken,"消したぞい★");
    return;
  }
  
  switch(messageReceive){
    case "memo":
    case "メモ":
      memoRep(replyToken);
      return;
    case "メモリスト":
      var memoList=getMemoList(usrNum);
      reply(replyToken,memoList);
      return;
    case "追加":
      setMemoMode(1);
      reply(replyToken,"はーい、メモする内容を記入するたんたん");
    　return;
    case "削除":
      setMemoMode(2);
      var delList=getMemoList(usrNum);
      delList="削除する行の番号を入力するたんたん\n"+delList;
      reply(replyToken,delList);
      return;
    default:
      messageSend= messageReceive+"たんたん";
      break;
  }
  
  reply(replyToken,messageSend);  
}

function insertMemoList(id,msg){
    //var memoListNum=Number(selectDB(profileDB,"memoList_num","where ID_num="+id))+1;
    insertDB(memoDB,"(ID_num,memo)","("+id+",'"+msg+"')");
    //updateDB(profileDB,"memoList_num="+memoListNum,"where ID_num="+id);
}

function getUsrNum(id){
  var usrNum= Number(selectDB(profileDB,"ID_num","where ID ='"+ id+"'").toString());
  return usrNum;
} 
  
function getMemoList(id_num){
  var temp=selectDB(memoDB,"memo,ROWID","where ID_num ="+id_num);
  var temp2="";
  for(var i=0;i<temp.length;i++){
    temp2=temp2+ temp[i][1] +" : "+temp[i][0]+"\n";
      }
  temp2=temp2.slice(0,-1);
  return temp2;
}

function deleteMemoList(id,messageReceive){
  try{
  deleteDB(memoDB,"where ID_num= "+id+" and ROWID = "+messageReceive);
  }
  catch(e){
  　return;
  }
  return;
}
  
//log
function log(data){
  var logColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).getValue();
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log').getRange(logColumn,1).setValue(data);
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log').getRange(logColumn,2).setValue(date);  
  logColumn++;
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(1,1).setValue(logColumn);
}

function send_log(data){
  var slColumn=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(3,1).getValue();
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('send_log').getRange(slColumn,1).setValue(data);
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('send_log').getRange(slColumn,2).setValue(date);  
  slColumn++;
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(3,1).setValue(slColumn);
}  

function setMemoMode(num){
  //0:false, 1:add 2,delete
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).setValue(num);
}


function morningCall() {
  var datehere=new Date();
  var dayWeek = datehere.getDay();
  var msg;
  switch(dayWeek){
    case 0:
      msg='日曜日です';
      break;
    default:
      msg='おっはよーー';
      break;
  }
  var pushTo = selectDB(profileDB,"ID","where ID_num=2").toString();
  push(msg,pushTo);
}
