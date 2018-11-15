//get ID from DataBase
var idDB="1pa46DGwJrv7WY3x_ESpZx9FQCsSgX-xDwBq314jg";
var idArray=selectDB(idDB,"ID_Name,ID","");
var access_token = idArray[0][1];
var spreadsheet_id = idArray[1][1];
var profileDB = idArray[2][1];
var memoDB= idArray[3][1];
//define sheet name
var valSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val');
var cronSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron');
var logSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log');
var sendlogSheet=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('send_log');
//get variable from sheet
var valArray=valSheet.getDataRange().getValues(); 
var memoMode=valArray[1][0];
var sendMode=valArray[1][1];
//日付取得
var date=new Date();
//lineApiのUrl
var replyUrl = "https://api.line.me/v2/bot/message/reply";
var pushUrl = "https://api.line.me/v2/bot/message/push";

/*
 * postされたときの処理
 */
function doPost(e) {
  var json = JSON.parse(e.postData.contents);
  log(json);
  var replyToken = json.events[0].replyToken;
  var messageReceive = json.events[0].message.text;
  var messageSend="";
  var usrID=json.events[0].source.userId;
  var usrNum=getUsrNum(usrID);
  
  switch (sendMode){
    case 1:
      var lastRow = cronSheet.getLastRow();
      if(messageReceive=="しょーちゃん"){   
         cronSheet.getRange(lastRow+1,7).setValue(1);
         setSendMode(2);
         reply(replyToken,"次に送りたいメッセージを記入するにゃ");
      }else if(messageReceive=="あーちゃん"){
         cronSheet.getRange(lastRow+1,7).setValue(2);
         setSendMode(2);
         reply(replyToken,"次に送りたいメッセージを記入するにゃ");        
      }
      else{
        setSendMode(0);        
        reply(replyToken,"その送り相手は登録されてませんね～");
      }
      return;
    case 2:
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
    usrNum=enrollProf(id);
  }else{
   usrNum=usrNum.toString(); 
  }
  return usrNum;
}

function enrollProf(id){
  var maxIdNum=Number(selectDB(profileDB,"MAXIMUM (ID_num)",""));
  var inputId=maxIdNum+1;
  insertDB(profileDB,"(ID_num,ID)","("+inputId+",'"+id+"')");
  return inputId;
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
  valSheet.getRange(2,1).setValue(num);
}

function setSendMode(num){
  //set memoMode number as below
  //0:wait,1:toSend,2:content,3:date
  valSheet.getRange(2,2).setValue(num);
}

function morningCall(cron,row,sheet) {
  var dayWeek = date.getDay();
  var userid=cron[6];
  var msg;
  switch(dayWeek){
    case 1:
      msg='おはよー、月曜だね。\n今週もがんばろー';
      break;
    case 4:
      msg='ちゃんと届いてるかな？？\n届いてたら次からは月曜だけ送信しまーす';
      return;
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

