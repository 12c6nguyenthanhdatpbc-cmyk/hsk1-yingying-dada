/**
 * TIẾNG TRUNG YINGYING DADA — GOOGLE APPS SCRIPT BRIDGE
 * Cầu nối giữa Website (GitHub Pages) và Google Sheets:
 *  - GET  ?action=getCurriculum : Đọc danh sách bài học, từ vựng, bài tập từ Google Sheets
 *  - POST (text/plain JSON)     : Ghi tự động kết quả làm bài của học viên vào tab "KetQua"
 *
 * HƯỚNG DẪN DEPLOY (chỉ làm 1 lần):
 *  1. Mở file Google Sheets -> Tiện ích mở rộng (Extensions) -> Apps Script.
 *  2. Dán toàn bộ mã này vào Code.gs và bấm Lưu (Ctrl+S).
 *  3. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment) -> Ứng dụng web (Web app):
 *     - Thực thi dưới tư cách (Execute as): Tôi (Me)
 *     - Người có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 *  4. Sao chép đường link Web App (https://script.google.com/macros/s/.../exec) và dán vào Website!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getCurriculum';

    if (action === 'ping') {
      return jsonOut({ ok: true, brand: 'Tiếng Trung YingYing DaDa', timestamp: new Date().toISOString() });
    }

    var baiHoc = readSheetObjects_(ss.getSheetByName('BaiHoc'));
    var tuVung = readSheetObjects_(ss.getSheetByName('TuVung'));
    var baiTap = readSheetObjects_(ss.getSheetByName('BaiTap'));

    return jsonOut({
      ok: true,
      updatedAt: new Date().toISOString(),
      baiHoc: baiHoc,
      tuVung: tuVung,
      baiTap: baiTap
    });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('KetQua');
    if (!sheet) {
      sheet = ss.insertSheet('KetQua');
      sheet.appendRow([
        'ThoiGian', 'HoTen', 'ZaloHoacLop', 'MaBai', 'TenBai',
        'DiemPhanTram', 'SoCauDung', 'TongSoCau',
        'TuVung_词', 'NguPhap_法', 'BaiKhoa_文', 'VietDich_写', 'NgheHieu_听'
      ]);
    }

    var nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    var skills = data.skills || {};
    sheet.appendRow([
      nowStr,
      data.studentName || 'Học viên ẩn danh',
      data.studentContact || '',
      data.lessonId || '',
      data.lessonTitle || '',
      Number(data.scorePct || 0),
      Number(data.correctCount || 0),
      Number(data.totalCount || 0),
      skills.vocab || '',
      skills.grammar || '',
      skills.reading || '',
      skills.writing || '',
      skills.listening || ''
    ]);

    return jsonOut({ ok: true, savedAt: nowStr });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function readSheetObjects_(sheet) {
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (!row[0] && !row[1]) continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      if (headers[c]) obj[headers[c]] = row[c];
    }
    rows.push(obj);
  }
  return rows;
}

function jsonOut(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
