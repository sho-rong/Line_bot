function selectDB(db,selector,text) {
　　// SQL文を作成
　　var sql = "SELECT "+ selector +" FROM " + db + " "+ text;
　　// FusionTablesのAPIを使って、SQLを実行
　　var result = FusionTables.Query.sqlGet(sql);
 return result.rows;
}

function insertDB(db,col,data){
  var sql = "INSERT INTO "+ db + " "+ col + " VALUES "+ data; 
  FusionTables.Query.sql(sql);
}

function deleteDB(db,data){
  var sql = "DELETE FROM " + db + " " + data;
  FusionTables.Query.sql(sql);
}  
  
function updateDB(db,set,condition){
  var sql = "UPDATE "+ db +" SET "+ set + " "+ condition;
  FusionTables.Query.sql(sql);
}