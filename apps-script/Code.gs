const SHEET_COMPLAINTS = "Complaints";
const SHEET_CATEGORIES = "Categories";
const SHEET_SYSTEMS = "Systems";

function doGet(e) {
  const action = e.parameter.action;

  switch (action) {

    case "getCategories":
      return jsonResponse(getCategories());

    case "getSystems":
      return jsonResponse(getSystems());

    case "getComplaints":
      return jsonResponse(getComplaints());

    case "dashboard":
      return jsonResponse(getDashboard());

    default:
      return jsonResponse({
        success: false,
        message: "Invalid Action"
      });
  }
}

function doPost(e) {

  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  switch (action) {

    case "addComplaint":
      return jsonResponse(addComplaint(data));

    case "updateStatus":
      return jsonResponse(updateStatus(data));

    case "deleteComplaint":
      return jsonResponse(deleteComplaint(data));

    case "addCategory":
      return jsonResponse(addCategory(data));

    case "deleteCategory":
      return jsonResponse(deleteCategory(data));

    case "addSystem":
      return jsonResponse(addSystem(data));

    case "deleteSystem":
      return jsonResponse(deleteSystem(data));

    default:
      return jsonResponse({
        success: false,
        message: "Invalid Action"
      });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==========================
   CATEGORY FUNCTIONS
========================== */

function getCategories() {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_CATEGORIES);

  const values =
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
      .getValues();

  return values.flat();
}

function addCategory(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_CATEGORIES);

  sheet.appendRow([
    data.category
  ]);

  return {
    success: true
  };
}

function deleteCategory(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_CATEGORIES);

  const values = sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i--) {

    if (values[i][0] === data.category) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return {
    success: true
  };
}

/* ==========================
   SYSTEM FUNCTIONS
========================== */

function getSystems() {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_SYSTEMS);

  const values = sheet.getDataRange().getValues();

  values.shift();

  return values.map(row => ({
    category: row[0],
    system: row[1]
  }));
}

function addSystem(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_SYSTEMS);

  sheet.appendRow([
    data.category,
    data.system
  ]);

  return {
    success: true
  };
}

function deleteSystem(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_SYSTEMS);

  const values = sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i--) {

    if (
      values[i][0] === data.category &&
      values[i][1] === data.system
    ) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return {
    success: true
  };
}

/* ==========================
   COMPLAINT FUNCTIONS
========================== */

function addComplaint(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_COMPLAINTS);

  const complaintId =
    generateComplaintId();

  const now = new Date();

  const date =
    Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "dd-MM-yyyy"
    );

  const time =
    Utilities.formatDate(
      now,
      Session.getScriptTimeZone(),
      "HH:mm:ss"
    );

  sheet.appendRow([
    complaintId,
    data.category,
    data.system,
    data.complaint,
    data.location,
    date,
    time,
    "Pending",
    ""
  ]);

  return {
    success: true,
    complaintId
  };
}

function getComplaints() {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_COMPLAINTS);

  const values =
    sheet.getDataRange().getValues();

  values.shift();

  return values.map(row => ({
    id: row[0],
    category: row[1],
    system: row[2],
    complaint: row[3],
    location: row[4],
    date: row[5],
    time: row[6],
    status: row[7],
    assigned: row[8]
  }));
}

function updateStatus(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_COMPLAINTS);

  const values =
    sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] === data.id) {

      sheet.getRange(i + 1, 8)
        .setValue(data.status);

      break;
    }
  }

  return {
    success: true
  };
}

function deleteComplaint(data) {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_COMPLAINTS);

  const values =
    sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i--) {

    if (values[i][0] === data.id) {

      sheet.deleteRow(i + 1);
      break;
    }
  }

  return {
    success: true
  };
}

/* ==========================
   DASHBOARD
========================== */

function getDashboard() {

  const complaints =
    getComplaints();

  let pending = 0;
  let progress = 0;
  let completed = 0;

  complaints.forEach(c => {

    if (c.status === "Pending")
      pending++;

    else if (
      c.status === "In Progress"
    )
      progress++;

    else if (
      c.status === "Completed"
    )
      completed++;
  });

  return {
    pending,
    progress,
    completed,
    total: complaints.length
  };
}

/* ==========================
   COMPLAINT ID
========================== */

function generateComplaintId() {

  const sheet =
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(SHEET_COMPLAINTS);

  const lastRow =
    sheet.getLastRow();

  if (lastRow <= 1) {
    return "CMP-0001";
  }

  const lastId =
    sheet
      .getRange(lastRow, 1)
      .getValue();

  const number =
    parseInt(
      lastId.replace("CMP-", "")
    ) + 1;

  return (
    "CMP-" +
    String(number).padStart(4, "0")
  );
}