const SPREADSHEET_ID = '13p0haCwj5YUhTyyapvU-haCGLLYPT4XShNhGRv5_QQI';
const SHEET_NAME = 'Sheet1';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Picker Performance Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDashboardData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Try configured name first, fall back to first sheet
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];
  if (!sheet) throw new Error('No sheets found in spreadsheet ' + SPREADSHEET_ID);

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    // Return sentinel so client can show a useful message
    return { _empty: true, _sheetName: sheet.getName(), _rows: data.length };
  }

  const headers = data[0];
  const rows = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
  rows._sheetName = sheet.getName(); // attach for debug; JS arrays allow extra properties
  return rows;
}
