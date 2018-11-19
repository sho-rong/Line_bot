function newCommer(id){
  var maxIdNum=Number(selectDB(profileDB,"MAXIMUM (ID_num)",""));
  var inputId=maxIdNum+1;
  insertDB(profileDB,"(ID_num,ID)","("+inputId+",'"+id+"')");
  return "newEnroll";
}  

function calnderFunction(events){
  var msg = "";
  if(events.length==0){
    msg="明日の予定はありません。";
    return msg;
  }
  
  msg += "明日の予定は" + String(events.length) + "件あります。\n";

  events.forEach( function(event, index){
    var title = event.getTitle();
    var start = event.getStartTime().getHours() + ":" + ("0" + event.getStartTime().getMinutes()).slice(-2);
    var end = event.getEndTime().getHours() + ":" + ("0" + event.getEndTime().getMinutes()).slice(-2);
    // 予定が終日の時
    if( event.isAllDayEvent() ){
      msg += String(index + 1) + "件目: " + title + " 終日の予定です。\n";
      return;
    }
    msg += String(index + 1) + "件目: " + title + " " + start + "~" + end + "\n";
  });
  return msg;
}  