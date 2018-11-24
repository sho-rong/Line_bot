//送りかえすheader
var headers = {
  "Content-Type" : "application/json; charset=UTF-8",
  'Authorization': 'Bearer ' + access_token,
};

/**
 * 指定のuser_idにpushをする
 */
function push(text,to) {
  var postData = {
    "to" : to,
    "messages" : [
      {
        'type':'text',
        'text':text,
      }
    ]
  };
  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };
  send_log(options);
  return UrlFetchApp.fetch(pushUrl, options);
}
 
/**
 * reply_tokenを使ってreplyする
 */
function reply(token,mes) {
  var postData = {
    "replyToken" : token,
    "messages" : [
      {
        'type':'text',
        'text': mes,
      }
    ]
  };
  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };
  send_log(options)
  return UrlFetchApp.fetch(replyUrl, options);
}

function memoRep(token){
  var postData = {
    "replyToken" : token,
    "messages" : [
      {
        "type":"template",
        "altText":"this is a memo template",
        "template":{
          "type":"buttons",
          "actions":[
            {
              "type":"message",
              "label":"メモリスト",
              "text": "メモリスト"
            },
            {
              "type":"message",
              "label":"追加",
              "text": "追加"
            },
            {
              "type":"message",
              "label":"削除",
              "text": "削除"
            },
            {
              "type":"message",
              "label":"リマインド",
              "text": "リマインド"
            },            
            ],
            "thumbnailImageUrl":"https://i0.wp.com/tatomac.net/wp-content/uploads/2017/01/slooProImg_20170114190255.jpg?resize=500%2C500&ssl=1",
            "title":"メモ帳たんたん♪",
            "text":"やりたい操作を選んでね💫"
        }
      }
    ]
  };
  var options = {
        "method" : "post",
        "headers" : headers,
        "payload" : JSON.stringify(postData)
  };
  send_log(options);    
  return UrlFetchApp.fetch(replyUrl, options);
}
      