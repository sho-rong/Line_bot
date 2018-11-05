var profileDB = "1vayxQvYyVDi8Ijt8g1SAOOSC3VJde5GsN6gpVODw";
var memoDB="1fWAtBza4G5vmddoAp7RYTNSPqXHocT-Bs1YMeTEe";

function selectDB(id,selector,text) {
　　// SQL文を作成
　　var sql = 'SELECT '+ selector +" FROM " + id + " "+ text;
　　// FusionTablesのAPIを使って、SQLを実行
　　var result = FusionTables.Query.sqlGet(sql);

 Logger.log(result.rows);
 return result.rows.toString();

}

function test(){
  selectDB(profileDB,"ID","where name='Saita'");
}

