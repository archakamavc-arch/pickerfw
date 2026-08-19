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
  const sheetName = sheet.getName();

  // GAS strips underscore-prefixed properties from google.script.run return values,
  // so use plain names in the sentinel object.
  if (data.length === 0) {
    return { status: 'EMPTY', sheetName: sheetName, rowCount: 0 };
  }
  if (data.length === 1) {
    return { status: 'HEADER_ONLY', sheetName: sheetName, rowCount: 1,
             headers: data[0].join(', ') };
  }

  const headers = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

// Run this manually in the Apps Script editor (Run → testAuth) to verify
// authorization and see sheet info in the Execution Log.
function testAuth() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets().map(s => `${s.getName()} (${s.getLastRow()} rows)`);
  Logger.log('Sheets found: ' + sheets.join(' | '));
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  Logger.log('Using sheet: ' + sheet.getName());
  Logger.log('Data rows (excl header): ' + Math.max(0, sheet.getLastRow() - 1));
  Logger.log('Headers: ' + sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].join(', '));
}
