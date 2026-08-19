const SPREADSHEET_ID = '13p0haCwj5YUhTyyapvU-haCGLLYPT4XShNhGRv5_QQI';
const SHEET_NAME = 'Sheet1';

function doGet() {
  const tmpl = HtmlService.createTemplateFromFile('Index');
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (!sheet || sheet.getLastRow() <= 1) {
      tmpl.jsonData = '{"h":[],"r":[]}';
    } else {
      const vals    = sheet.getDataRange().getValues();
      const allHdrs = vals[0];

      // Send only the columns the dashboard needs (strips pre-computed averages & Store Code)
      const KEEP = ['Date','Picker_ID','Stores','City.Final','City Head.Final','Zone',
                    'Total_Orders','Total_Units','Total_INF','Total_PRTO','Total_Returns',
                    'Total_Misshipment','Total_Missing_Item','Total_Instore_Time_Sec'];

      const idxMap   = KEEP.map(k => allHdrs.indexOf(k));
      const usedKeys = KEEP.filter((_,i)  => idxMap[i] >= 0);
      const usedIdxs = idxMap.filter(i    => i >= 0);

      const rows = vals.slice(1).map(row =>
        usedIdxs.map(i => {
          const v = row[i];
          // Format GAS Date objects as YYYY-MM-DD to save space and avoid timezone issues
          return (v instanceof Date)
            ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd')
            : v;
        })
      );

      // Escape </script> so the browser doesn't misparse the embedded JSON
      tmpl.jsonData = JSON.stringify({ h: usedKeys, r: rows })
                          .replace(/<\/script>/gi, '<\\/script>');
    }
  } catch (e) {
    tmpl.jsonData = JSON.stringify({ error: e.message });
  }

  return tmpl.evaluate()
    .setTitle('Picker Performance Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Run manually in the Apps Script editor to verify sheet access
function testAuth() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheets().forEach(s => Logger.log(s.getName() + ': ' + s.getLastRow() + ' rows'));
}
