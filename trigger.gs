function setTrigger(year,month,day,hour,min){
  var setTime = new Date();
  setTime.setYear(year);
  setTime.setMonth(month-1);
  setTime.setDate(day);
  setTime.setHours(hour);
  setTime.setMinutes(min); 
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();
}

function setDailyCall(){
  var setTime= new Date();
  setTime.setHours(7);
  setTime.setMinutes(00);
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();
  setTime.setHours(21);
  ScriptApp.newTrigger('cronFunction').timeBased().at(setTime).create();  
}