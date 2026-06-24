var EVENT_REGISTRY_TITLE = "Agenda CRO-MG | Base de eventos";
var EVENT_REGISTRY_SHEET = "Eventos";
var EVENT_REGISTRY_HEADERS = [
  "id",
  "name",
  "type",
  "city",
  "location",
  "address",
  "startDate",
  "endDate",
  "startTime",
  "endTime",
  "audience",
  "description",
  "owner",
  "status",
  "priority",
  "pageUrl",
  "registrationUrl",
  "driveUrl",
  "notes"
];

function doGet(e) {
  var resource = e && e.parameter ? e.parameter.resource : "";

  if (resource === "events") {
    return jsonResponse_({
      ok: true,
      events: listEvents_()
    });
  }

  return jsonResponse_({
    ok: true,
    service: "Agenda CRO-MG Apps Script",
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var payload = parseRequest_(e);
    assertAuthorized_(payload);
    var action = payload.action || "create";
    assertPayload_(payload, action);
    var result;

    if (action === "upsertEvent") {
      result = upsertEvent_(payload);
    } else if (action === "sync") {
      result = syncSpreadsheet_(payload);
    } else {
      result = createOrReuseSpreadsheet_(payload);
    }

    return jsonResponse_(result);
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    });
  }
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Requisição vazia.");
  }

  return JSON.parse(e.postData.contents);
}

function assertAuthorized_(payload) {
  var expectedSecret = PropertiesService.getScriptProperties().getProperty(
    "API_SHARED_SECRET"
  );

  if (expectedSecret && payload.secret !== expectedSecret) {
    throw new Error("Segredo inválido para o Apps Script.");
  }
}

function assertPayload_(payload, action) {
  if (action === "upsertEvent") {
    if (!payload.event || !payload.event.id || !payload.event.name) {
      throw new Error("Os dados do evento são obrigatórios.");
    }
    return;
  }

  if (!payload.eventId) {
    throw new Error("eventId é obrigatório.");
  }

  if (!payload.spreadsheetTitle) {
    throw new Error("spreadsheetTitle é obrigatório.");
  }

  if (!payload.sheets || !payload.sheets.length) {
    throw new Error("Nenhuma aba foi enviada para sincronização.");
  }
}

function upsertEvent_(payload) {
  var event = normalizeEvent_(payload.event);
  var spreadsheet = getOrCreateEventRegistrySpreadsheet_(payload.folderId);
  var sheet = ensureEventRegistrySheet_(spreadsheet);
  var data = sheet.getDataRange().getValues();
  var targetRow = -1;

  for (var rowIndex = 1; rowIndex < data.length; rowIndex++) {
    if (String(data[rowIndex][0] || "") === event.id) {
      targetRow = rowIndex + 1;
      break;
    }
  }

  var rowValues = eventToRow_(event);

  if (targetRow === -1) {
    targetRow = sheet.getLastRow() + 1;
  }

  sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  styleSheet_(sheet, EVENT_REGISTRY_HEADERS.length);

  return {
    ok: true,
    event: event
  };
}

function listEvents_() {
  try {
    var spreadsheet = getOrCreateEventRegistrySpreadsheet_("");
    var sheet = ensureEventRegistrySheet_(spreadsheet);
    var values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      return [];
    }

    var events = [];
    for (var rowIndex = 1; rowIndex < values.length; rowIndex++) {
      var row = values[rowIndex];
      if (!String(row[0] || "").trim()) {
        continue;
      }
      events.push(rowToEvent_(row));
    }

    return events;
  } catch (error) {
    Logger.log(error);
    return [];
  }
}

function getOrCreateEventRegistrySpreadsheet_(folderId) {
  var storedId = PropertiesService.getScriptProperties().getProperty(
    "EVENT_REGISTRY_SPREADSHEET_ID"
  );

  if (storedId && fileExists_(storedId)) {
    return SpreadsheetApp.openById(storedId);
  }

  if (folderId) {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);

    while (files.hasNext()) {
      var file = files.next();
      if (file.getName() === EVENT_REGISTRY_TITLE) {
        PropertiesService.getScriptProperties().setProperty(
          "EVENT_REGISTRY_SPREADSHEET_ID",
          file.getId()
        );
        return SpreadsheetApp.openById(file.getId());
      }
    }
  }

  var spreadsheet = SpreadsheetApp.create(EVENT_REGISTRY_TITLE);
  PropertiesService.getScriptProperties().setProperty(
    "EVENT_REGISTRY_SPREADSHEET_ID",
    spreadsheet.getId()
  );
  moveFileToTargetFolder_(spreadsheet.getId(), folderId);
  ensureEventRegistrySheet_(spreadsheet);
  return spreadsheet;
}

function ensureEventRegistrySheet_(spreadsheet) {
  var sheet = spreadsheet.getSheetByName(EVENT_REGISTRY_SHEET);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(EVENT_REGISTRY_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, EVENT_REGISTRY_HEADERS.length)
      .setValues([EVENT_REGISTRY_HEADERS]);
    styleSheet_(sheet, EVENT_REGISTRY_HEADERS.length);
  }

  return sheet;
}

function normalizeEvent_(event) {
  return {
    id: String(event.id || ""),
    name: String(event.name || ""),
    type: String(event.type || ""),
    city: String(event.city || ""),
    location: String(event.location || ""),
    address: String(event.address || ""),
    startDate: String(event.startDate || ""),
    endDate: String(event.endDate || ""),
    startTime: String(event.startTime || ""),
    endTime: String(event.endTime || ""),
    audience: String(event.audience || ""),
    description: String(event.description || ""),
    owner: String(event.owner || ""),
    status: String(event.status || ""),
    priority: String(event.priority || ""),
    pageUrl: String(event.pageUrl || ""),
    registrationUrl: String(event.registrationUrl || ""),
    driveUrl: String(event.driveUrl || ""),
    notes: String(event.notes || "")
  };
}

function eventToRow_(event) {
  return [
    event.id,
    event.name,
    event.type,
    event.city,
    event.location,
    event.address,
    event.startDate,
    event.endDate,
    event.startTime,
    event.endTime,
    event.audience,
    event.description,
    event.owner,
    event.status,
    event.priority,
    event.pageUrl,
    event.registrationUrl,
    event.driveUrl,
    event.notes
  ];
}

function rowToEvent_(row) {
  return {
    id: String(row[0] || ""),
    name: String(row[1] || ""),
    type: String(row[2] || ""),
    city: String(row[3] || ""),
    location: String(row[4] || ""),
    address: String(row[5] || ""),
    startDate: String(row[6] || ""),
    endDate: String(row[7] || ""),
    startTime: String(row[8] || ""),
    endTime: String(row[9] || ""),
    audience: String(row[10] || ""),
    description: String(row[11] || ""),
    owner: String(row[12] || ""),
    status: String(row[13] || ""),
    priority: String(row[14] || ""),
    pageUrl: String(row[15] || ""),
    registrationUrl: String(row[16] || ""),
    driveUrl: String(row[17] || ""),
    notes: String(row[18] || "")
  };
}

function createOrReuseSpreadsheet_(payload) {
  var existingSpreadsheetId = findSpreadsheetIdForEvent_(payload);

  if (existingSpreadsheetId) {
    payload.spreadsheetId = existingSpreadsheetId;
    return syncSpreadsheet_(payload);
  }

  var spreadsheet = SpreadsheetApp.create(payload.spreadsheetTitle);
  var spreadsheetId = spreadsheet.getId();
  var spreadsheetUrl = spreadsheet.getUrl();

  moveFileToTargetFolder_(spreadsheetId, payload.folderId);
  ensureBaseStructure_(spreadsheet, payload);
  writePayloadToSpreadsheet_(spreadsheet, payload);
  persistSpreadsheetBinding_(payload.eventId, spreadsheetId);

  return {
    ok: true,
    mode: "created",
    spreadsheetId: spreadsheetId,
    spreadsheetUrl: spreadsheetUrl,
    syncedAt: new Date().toISOString(),
    title: payload.spreadsheetTitle
  };
}

function syncSpreadsheet_(payload) {
  var spreadsheetId = payload.spreadsheetId || findSpreadsheetIdForEvent_(payload);

  if (!spreadsheetId) {
    return createOrReuseSpreadsheet_(payload);
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  if (spreadsheet.getName() !== payload.spreadsheetTitle) {
    spreadsheet.rename(payload.spreadsheetTitle);
  }

  moveFileToTargetFolder_(spreadsheetId, payload.folderId);
  ensureBaseStructure_(spreadsheet, payload);
  writePayloadToSpreadsheet_(spreadsheet, payload);
  persistSpreadsheetBinding_(payload.eventId, spreadsheetId);

  return {
    ok: true,
    mode: "synced",
    spreadsheetId: spreadsheetId,
    spreadsheetUrl: spreadsheet.getUrl(),
    syncedAt: new Date().toISOString(),
    title: payload.spreadsheetTitle
  };
}

function ensureBaseStructure_(spreadsheet, payload) {
  var existingNames = spreadsheet
    .getSheets()
    .map(function(sheet) {
      return sheet.getName();
    });

  payload.sheets.forEach(function(sheetPayload) {
    if (existingNames.indexOf(sheetPayload.sheetName) === -1) {
      spreadsheet.insertSheet(sheetPayload.sheetName);
    }
  });

  var metaSheet = spreadsheet.getSheetByName("_Meta");
  if (!metaSheet) {
    metaSheet = spreadsheet.insertSheet("_Meta");
    metaSheet.hideSheet();
  }
}

function writePayloadToSpreadsheet_(spreadsheet, payload) {
  payload.sheets.forEach(function(sheetPayload) {
    var sheet = spreadsheet.getSheetByName(sheetPayload.sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetPayload.sheetName);
    }

    clearSheet_(sheet);
    var values = [sheetPayload.headers].concat(sheetPayload.rows || []);
    if (!values.length) {
      return;
    }

    sheet
      .getRange(1, 1, values.length, values[0].length)
      .setValues(values);
    styleSheet_(sheet, values[0].length);
  });

  writeMetaSheet_(spreadsheet, payload);
}

function clearSheet_(sheet) {
  sheet.clearContents();
  sheet.clearFormats();
}

function styleSheet_(sheet, columnCount) {
  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, 1, columnCount)
    .setFontWeight("bold")
    .setBackground("#dff3eb");
  sheet.autoResizeColumns(1, columnCount);
}

function writeMetaSheet_(spreadsheet, payload) {
  var metaSheet = spreadsheet.getSheetByName("_Meta");
  metaSheet.clearContents();
  metaSheet.clearFormats();

  var metaValues = [
    ["eventId", payload.eventId],
    ["eventName", payload.event ? payload.event.name : ""],
    ["lastSyncAt", new Date().toISOString()]
  ];

  metaSheet.getRange(1, 1, metaValues.length, 2).setValues(metaValues);
  metaSheet.hideSheet();
}

function persistSpreadsheetBinding_(eventId, spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty(
    "EVENT_MAP_" + eventId,
    spreadsheetId
  );
}

function findSpreadsheetIdForEvent_(payload) {
  var storedId = PropertiesService.getScriptProperties().getProperty(
    "EVENT_MAP_" + payload.eventId
  );

  if (storedId && fileExists_(storedId)) {
    return storedId;
  }

  if (!payload.folderId) {
    return "";
  }

  var folder = DriveApp.getFolderById(payload.folderId);
  var files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (files.hasNext()) {
    var file = files.next();
    try {
      var spreadsheet = SpreadsheetApp.openById(file.getId());
      var metaSheet = spreadsheet.getSheetByName("_Meta");

      if (!metaSheet) {
        continue;
      }

      var eventId = String(metaSheet.getRange("B1").getValue() || "");
      if (eventId === payload.eventId) {
        persistSpreadsheetBinding_(payload.eventId, file.getId());
        return file.getId();
      }
    } catch (error) {
      Logger.log(error);
    }
  }

  return "";
}

function moveFileToTargetFolder_(fileId, folderId) {
  if (!folderId) {
    return;
  }

  var file = DriveApp.getFileById(fileId);
  var targetFolder = DriveApp.getFolderById(folderId);
  targetFolder.addFile(file);

  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    if (parent.getId() !== folderId) {
      parent.removeFile(file);
    }
  }
}

function fileExists_(fileId) {
  try {
    DriveApp.getFileById(fileId);
    return true;
  } catch (error) {
    return false;
  }
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
