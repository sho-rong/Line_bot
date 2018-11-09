function setTrigger(){
  var setTime = new Date();
  setTime.setHours(7);
  setTime.setMinutes(00); 
  ScriptApp.newTrigger('morningCall').timeBased().at(setTime).create();
}

