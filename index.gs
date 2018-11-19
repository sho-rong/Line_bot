var properties = PropertiesService.getScriptProperties();
//get ID from Property
var access_token = properties.getProperty("access_token");
var spreadsheet_id = properties.getProperty("spreadsheet_id");
var profileDB = properties.getProperty("profileDB");
var memoDB= properties.getProperty("memoDB");
//define sheet name
var cronSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron');
var logSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log');
var sendlogSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('send_log');
//get variable from sheet
var memoMode=Number(properties.getProperty("memoMode"));
var sendMode=Number(properties.getProperty("sendMode"));
var enrollMode=Number(properties.getProperty("enrollMode"));
var translateMode=Number(properties.getProperty("translateMode"));
//日付取得
var date=new Date();
//lineApiのUrl
var replyUrl = "https://api.line.me/v2/bot/message/reply";
var pushUrl = "https://api.line.me/v2/bot/message/push";
var replyToken;

/*
 * postされたときの処理
 */
function doPost(e) {
  var json = JSON.parse(e.postData.contents);
  log(json);
  replyToken = json.events[0].replyToken;
  var messageReceive = json.events[0].message.text;
  var messageSend="";
  var usrID=json.events[0].source.userId;
  var usrNum=getUsrNum(usrID);
  
  if(usrNum=="NewEnroll"){
    reply(replyToken,"はじめまして。よろしくね！");
    return;
  }
  
  switch(enrollMode){
    case 1:
      setEnrollMode(0);
      updateDB(profileDB,"name='"+messageReceive+"'","WHERE ID_num="+usrNum);
      reply(replyToken,"OK!登録～　この名前が送信予約の宛先になるよ～");
      return;
  }
  
  switch(translateMode){
    case 1:
      properties.setProperty("translateMes", messageReceive);
      reply(replyToken,"OK!,次に翻訳先の言語コードを教えて。\n英語:en\n中国語:zh\n日本語:ja\n韓国語:ko");
      setTranslateMode(2);
      return;
    case 2:
      setTranslateMode(0);
      var transMes=properties.getProperty("translateMes");
      try{
      var result = LanguageApp.translate(transMes, "", messageReceive);
      reply(replyToken,result);
      }catch(e){
        reply(replyToken,e);
      }
      return;
  }
      
  switch (sendMode){
    case 1:
      setSendMode(0);      
      var lastRow = cronSheet.getLastRow();
      var sendID=Number(selectDB(profileDB,"ID_num","WHERE name='"+messageReceive+"'"));
      if(sendID){
         cronSheet.getRange(lastRow+1,7).setValue(sendID);
         setSendMode(2);
         reply(replyToken,"次に送りたいメッセージを記入するにゃ");
      }
      else{        
        reply(replyToken,"その送り相手は登録されてませんね～\n最初からやり直してね！");
      }
      return;
    case 2:
      var sender=selectDB(profileDB,"name","WHERE ID_num="+usrNum).toString();
      messageReceive="from "+sender+"\n"+messageReceive;
      var lastRow = cronSheet.getLastRow();
      cronSheet.getRange(lastRow,10).setValue(messageReceive);
      setSendMode(3);
      reply(replyToken,"最後に、送る日時を指定してね～\n例）2018/12/25/9:00\n2010/1/1/0:00");
      return;
    case 3:
      setSendMode(0);
      var msg = messageReceive.toString().split(/:|\//);
      //ここに日時チェックを入れる
      var lastRow = cronSheet.getLastRow();
      var sendMes=cronSheet.getRange(lastRow,10).getValue();
      var usrid=cronSheet.getRange(lastRow,7).getValue();
      cronSheet.deleteRow(lastRow);     
      var cronData=[msg[4],msg[3],msg[2],msg[1],msg[0],"sendBookFunction",usrid,,"no",sendMes];
      cronSheet.appendRow(cronData);
      setTrigger(Number(msg[0]),Number(msg[1]),Number(msg[2]),Number(msg[3]),Number(msg[4]));
      reply(replyToken,"はーい、予約完了！");
      return;
  }
    
  switch(memoMode){
    case 1:
      setMemoMode(0);
      insertMemoList(usrNum,messageReceive);
      reply(replyToken,"追加したぞい🌟");
      return;
    case 2:
      setMemoMode(0);
      var mes=deleteMemoList(usrNum,messageReceive);
      reply(replyToken,mes);
      return;
    case 3:
      setMemoMode(0);
      var resMes=remindMemo(usrNum,messageReceive);
      reply(replyToken,resMes);
      return;
    default:
      break;
  }
      
  switch(messageReceive){
    case "memo":
    case "メモ":
      memoRep(replyToken);
      return;
    case "メモリスト":
      messageSend=getMemoList(usrNum);
      break;
    case "追加":
      setMemoMode(1);
      messageSend="はーい、メモする内容を記入するたんたん";
    　break;
    case "削除":
      setMemoMode(2);
      var delList=getMemoList(usrNum);
      messageSend="削除する行の番号を入力するたんたん\n"+delList;
      break;
    case "リマインド":
      setMemoMode(3);
      var remindList=getMemoList(usrNum);
      remindList="メモ番号/朝またはメモ番号/夜って入力してね～(ex.1/夜)\n"+remindList;
      messageSend="------リマインド------\n"+remindList;
      break;
    case "送信予約":
      setSendMode(1);
      messageSend="送りたい相手を入力してね！";
      break;
    case "プロフィール":
      setEnrollMode(1);
      messageSend="名前を教えてね♪";
      break;
    case "カレンダー":
      var calId=selectDB(profileDB,"gmail","where ID_num="+usrNum).toString();
      console.log(calId);
      var cal=CalendarApp.getCalendarById(calId);
      var nextMonth = new Date(date.getFullYear(), date.getMonth()+1, date.getDate());
      // googleカレンダーより明日の予定を配列で取得。
      var Event = cal.getEvents(date,nextMonth);
      console.log(Event);
      messageSend=calnderFunction(Event);
      break;
    case "翻訳":
      setTranslateMode(1);
      reply(replyToken,"翻訳したい文章を入力してね。");
      break;
    default:
      messageSend= messageReceive+"にゃ";
      break;
  }
  
  reply(replyToken,messageSend);
}

function remindMemo(id,msg){
  var message = msg.toString().split("/");
  console.log(message);
  if(message.length==2){
    var cronData;
    if(message[1]==="朝"){
      cronData= ["00","7","*","*","*","remindCronFunction",id,message[0],"no"];
    }
    else if(message[1]==="夜"){
      cronData= ["00","21","*","*","*","remindCronFunction",id,message[0],"no"];
    }else{
      return "朝か夜だけだよ^^";
    }
      console.log(cronData);
      cronSheet.appendRow(cronData);
      return "とうろくぅぅ。朝は7時、夜は22時に送られるよ～";
  }else{
    return "形式が違うよ～(´;ω;｀)";
  }
}

function insertMemoList(id,msg){
  insertDB(memoDB,"(ID_num,memo)","("+id+",'"+msg+"')");
}

function getUsrNum(id){
  var usrNum= Number(selectDB(profileDB,"ID_num","where ID ='"+ id+"'"));
  if(isNaN(usrNum)==true){
    usrNum=newCommer(id);
  }else{
   usrNum=usrNum.toString(); 
  }
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
  　return "削除失敗！ 番号は合ってる？？";
  }
  return "消したぞい★";
}
  
function log(json){
  var logging=[json.events[0],date];
  logSheet.appendRow(logging);
}

function send_log(data){
  var log=[data,date];
  sendlogSheet.appendRow(log);
}

function setMemoMode(num){
  //set memoMode number as below
  //0:false,1:add,2:delete,3:remind
  properties.setProperty("memoMode",num);
}

function setSendMode(num){
  //set memoMode number as below
  //0:wait,1:toSend,2:content,3:date
  properties.setProperty("sendMode",num);
}

function setEnrollMode(num){
  //set EnrollMode
  //1:Name,2:Sex,3:Birthday,4,Job
  properties.setProperty("enrollMode",num);
}

function setTranslateMode(num){
  properties.setProperty("translateMode",num);
}

function morningCall(cron,row,sheet) {
  var dayWeek = date.getDay();
  var userid=cron[6];
  var msg;
  switch(dayWeek){
    case 1:
      msg='おはよー、月曜だね。\n今週もがんばろー';
      break;
  }
  var pushTo = selectDB(profileDB,"ID","where ID_num="+userid).toString();
  push(msg,pushTo);
}

function remindCronFunction(cron,row,sheet){
   var userid=cron[6]; 
   var memoid=cron[7];
   var pushTo = selectDB(profileDB,"ID","where ID_num="+userid).toString();
   var msg=selectDB(memoDB,"memo","where ROWID="+memoid).toString(); 
   sheet.getRange(row,9).setValue("yes"); // 最終リクエスト送信日時   
   push(msg,pushTo);
} 

function sendBookFunction(cron,row,sheet){
   var userid=cron[6]; 
   var message=cron[9];
   var pushTo = selectDB(profileDB,"ID","where ID_num="+userid).toString();
   console.log("here");
   sheet.getRange(row,9).setValue("yes"); // 最終リクエスト送信日時   
   push(message,pushTo);
} 

