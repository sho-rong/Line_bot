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
  

function test3(){
  str="("+"1"+","+"'"+"test4"+"'"+")";
  Logger.log(str);
}


function test2(){
  insertDB(memoDB,"(ID_num,memo)","(1,'test4')");
}

function test(){
  var re=selectDB(profileDB,"ID","where ID_num=1");
  Logger.log(re);
}

  function test4(){
    var tmp=selectDB(profileDB,"ID","");
    for(var i=0;i<tmp.length;i++){
      Logger.log(tmp[i][0]);
    }
  }

function test5(){
  var name=selectDB(profileDB,"ID","where ID_num=2").toString()
  Logger.log(name);
}
