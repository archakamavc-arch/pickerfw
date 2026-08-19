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
      const allVals = sheet.getDataRange().getValues();
      const H = allVals[0];

      // Header → sheet column index
      const ci = {};
      H.forEach((h, i) => { ci[h] = i; });

      const DIMS = ['Date','Picker_ID','Stores','City.Final','City Head.Final','Zone'];
      const NUMS = ['Total_Orders','Total_Units','Total_INF','Total_PRTO','Total_Returns',
                    'Total_Misshipment','Total_Missing_Item','Total_Instore_Time_Sec'];
      const KEYS   = DIMS.concat(NUMS).filter(k => ci[k] !== undefined);
      const numSet = new Set(NUMS);
      const tz     = Session.getScriptTimeZone();

      // Pre-aggregate by (Date, Picker_ID, Stores) — collapses multiple intra-day rows
      const agg = {};
      for (let i = 1, n = allVals.length; i < n; i++) {
        const row  = allVals[i];
        const rawD = row[ci['Date']];
        const dateS = rawD instanceof Date
          ? Utilities.formatDate(rawD, tz, 'yyyy-MM-dd')
          : String(rawD || '').substring(0, 10);
        if (!dateS) continue;

        const pid   = String(row[ci['Picker_ID']] || '');
        const store = String(row[ci['Stores']]    || '');
        const key   = dateS + '\x00' + pid + '\x00' + store;

        if (!agg[key]) {
          const rec = {};
          KEYS.forEach(k => {
            if (k === 'Date')        rec[k] = dateS;
            else if (!numSet.has(k)) rec[k] = String(row[ci[k]] || '');
            else                     rec[k] = 0;
          });
          agg[key] = rec;
        }
        KEYS.forEach(k => { if (numSet.has(k)) agg[key][k] += (+row[ci[k]] || 0); });
      }

      const rows = Object.values(agg).map(rec => KEYS.map(k => rec[k]));
      tmpl.jsonData = JSON.stringify({ h: KEYS, r: rows })
                          .replace(/<\/script>/gi, '<\\/script>');
    }
  } catch(e) {
    tmpl.jsonData = JSON.stringify({ error: e.message });
  }

  return tmpl.evaluate()
    .setTitle('Picker Performance Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function testAuth() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheets().forEach(s => Logger.log(s.getName() + ': ' + s.getLastRow() + ' rows'));
}
