// line developersに書いてあるChannel Access Token
var access_token = "gCjz7rdS4acOP03bBTXTg4+0ehR98xcfjPZgdRdaqu6/SUZNciEImKJcsq708qRUv2btxs0idBYl0sdjVQtZhbSDeVgxL3olr1qkoTyZvAJQl2XOSeF7vUMvaro/Nwd6dTtGTNG5f2zjH/i2xPw1IwdB04t89/1O/w1cDnyilFU="
// ログ用スプレッドシートのid
var spreadsheet_id = "1tSMYNPh3gapK84ZCHe81Rnx4oCUkEqXXUR3OH7IB69g"
//lineApiのUrl
var replyUrl = "https://api.line.me/v2/bot/message/reply";
var pushUrl = "https://api.line.me/v2/bot/message/push";
//日付取得
var date=new Date();

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
  var memoMode=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).getValue();
  var sendMode=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,3).getValue();
  var memoColumn = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,1).getValue();
  var usrNum=getUsrNum(usrID);
  
  switch (sendMode){
    case 1:
      var lastRow = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getLastRow();
      if(messageReceive=="しょーちゃん"){   
         SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getRange(lastRow+1,7).setValue(1);
         setSendMode(2);
         reply(replyToken,"次に送りたいメッセージを記入するにゃ");
      }else{
        setSendMode(0);        
        reply(replyToken,"その送り相手は登録されてませんね～");
      }
      return;
    case 2:
       var lastRow = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getLastRow();
       SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getRange(lastRow,10).setValue(messageReceive);
       setSendMode(3);
       reply(replyToken,"最後に、送る日時を指定してね～\n例）2018/12/25/9:00\n2010/1/1/0:00");
       return;
    case 3:
       var lastRow = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getLastRow();
       var sendMes=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getRange(lastRow,10).getValue();
       var usrid=SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getRange(lastRow,7).getValue();
       SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').deleteRow(lastRow);
       var msg = messageReceive.toString().split(/:|\//);      
       var cronData=[msg[4],msg[3],msg[2],msg[1],"*","sendBookFunction",usrid,,"no",sendMes];
       SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').appendRow(cronData);
       setSendMode(0);
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
      deleteMemoList(usrNum,messageReceive);
      reply(replyToken,"消したぞい★");
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
      //remindList="形式は、メモ番号/年/月/日/時間/分でよろしく～\n"+remindList;
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
    //var lastRow = SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').getLastRow();
    var cronData;
    if(message[1]==="朝"){
      cronData= ["00-10","7","*","*","*","remindCronFunction",id,message[0],"no"];
    }
    else if(message[1]==="夜"){
      cronData= ["00-10","22","*","*","*","remindCronFunction",id,message[0],"no"];
    }else{
      return "朝か夜だけだよ^^";
    }
      console.log(cronData);
      SpreadsheetApp.openById(spreadsheet_id).getSheetByName('cron').appendRow(cronData);
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
  　return;
  }
  return;
}
  
function log(json){
  var logging=[json.events[0],date];
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('log').appendRow(logging);
}

function send_log(data){
  var log=[data,date];
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('send_log').appendRow(log);
}

function setMemoMode(num){
  //set memoMode number as below
  //0:false,1:add,2:delete,3:remind
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,2).setValue(num);
}

function setSendMode(num){
  //set memoMode number as below
  //0:false,1:add,2:delete,3:remind
  SpreadsheetApp.openById(spreadsheet_id).getSheetByName('val').getRange(2,3).setValue(num);
}

function morningCall() {
  var dayWeek = date.getDay();
  var msg;
  switch(dayWeek){
    case 1:
      msg='おはよー、今週もがんばろー';
      break;
    default:
      return;
  }
  var pushTo = selectDB(profileDB,"ID","where ID_num=2").toString();
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

