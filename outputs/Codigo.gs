function doGet() {
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
    assertPayload_(payload);

    var action = payload.action === "sync" ? "sync" : "create";
    var result =
      action === "sync"
        ? syncSpreadsheet_(payload)
        : createOrReuseSpreadsheet_(payload);

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

function assertPayload_(payload) {
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
