const SPREADSHEET_ID = '13p0haCwj5YUhTyyapvU-haCGLLYPT4XShNhGRv5_QQI';
const SHEET_NAME = 'Sheet1';

function doGet() {
  const tmpl = HtmlService.createTemplateFromFile('Index');
  try {
    const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    if (!sheet || sheet.getLastRow() <= 1) {
      tmpl.jsonData = '[]';
    } else {
      const vals = sheet.getDataRange().getValues();
      const hdrs = vals[0];
      tmpl.jsonData = JSON.stringify(
        vals.slice(1).map(row => {
          const obj = {};
          hdrs.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        })
      );
    }
  } catch (e) {
    tmpl.jsonData = JSON.stringify({ error: e.message });
  }
  return tmpl.evaluate()
    .setTitle('Picker Performance Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Run this manually in the editor to verify sheet access (Run → testAuth)
function testAuth() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheets().forEach(s => Logger.log(s.getName() + ': ' + s.getLastRow() + ' rows'));
}
