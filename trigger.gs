function setTrigger(year,month,day,hour,min){
  var setTime = new Date();
  setTime.setYear(year);
  setTime.setMonth(month-1);
  setTime.setDate(day);
  setTime.setHours(hour);
  setTime.setMinutes(min); 
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();
}

/*
function delTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getTriggerSource() == "CLOCK") {
      Logger.log(i);
      //ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}
*/

/*
function showStatus(){
  var myCell = cronSheet.getActiveCell(); //アクティブセルを取得
  if(myCell.getValue()=="yes"){ //アクティブセルがI列かを判定
    Browser.msgBox(myCell.getRow() + '行目のステータスが変更されました');
  }
}
*/

function setDailyCall(){
  var setTime= new Date();
  setTime.setHours(7);
  setTime.setMinutes(00);
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();
  setTime.setHours(21);
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();  
}