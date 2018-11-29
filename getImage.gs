function get_line_image(message_id) {
  var headers = {
    'Authorization': 'Bearer ' + access_token,
  };
  var options = {
    'method'  : 'GET',
    'headers': headers
  };
  var url = 'https://api.line.me/v2/bot/message/' + message_id + '/content';
  var blob = UrlFetchApp.fetch(url, options).getBlob();
  return blob;  
}

// OCRするやつ
function ocr(imgBlob) {
  var resource = {
    title: imgBlob.getName(),
    mimeType: imgBlob.getContentType()
  };
  var options = {
    ocr: true
  };
  try {
    var imgFile = Drive.Files.insert(resource, imgBlob, options);
    var doc = DocumentApp.openById(imgFile.id);
    var text = doc.getBody().getText().replace("\n", "");
    var res = Drive.Files.remove(imgFile.id);
  } catch(e) {
    //log_ocr('err in ocr::ocr: '+e);
    return 'err'+e;
  }
  return text;
}

  