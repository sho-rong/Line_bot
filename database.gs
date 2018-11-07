var profileDB = "1vayxQvYyVDi8Ijt8g1SAOOSC3VJde5GsN6gpVODw";
var memoDB="1fWAtBza4G5vmddoAp7RYTNSPqXHocT-Bs1YMeTEe";

function selectDB(db,selector,text) {
　　// SQL文を作成
　　var sql = "SELECT "+ selector +" FROM " + db + " "+ text;
　　// FusionTablesのAPIを使って、SQLを実行
　　var result = FusionTables.Query.sqlGet(sql);

 Logger.log(result.rows);
 return result.rows;

}

function insertDB(db,col,data){
  var sql = "INSERT INTO "+ db + " "+ col + " VALUES "+ data; 
  FusionTables.Query.sql(sql);
  Logger.log(data);
}

function deleteDB(db,data){
  var sql = "DELETE FROM " + db + " " + data;
  FusionTables.Query.sql(sql);
  Logger.log(data);
}  
  
