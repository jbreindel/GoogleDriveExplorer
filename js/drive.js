/*****************************************************************************************
 *
 * FILE:                drive.js
 * AUTHOR:              Jake Breindel
 * DATE:                2-27-2014
 *
 * DESRIPTION:
 *  javascript file for
 *
 * University At Buffalo, Web Services 2014
 *
 ******************************************************************************************/

var CLIENT_ID = '{your-client-id}';
var SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.apps.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly';
// default size of the list
var LIST_SIZE = 100;
// naxt page global if the list is too large
var nextPage;

/*************************************************************** HELPERS ***************************************************************/

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
    window.setTimeout(checkAuth, 1);
}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
    gapi.auth.authorize({
        'client_id' : CLIENT_ID,
        'scope' : SCOPES,
        'immediate' : true
    }, handleAuthResult);
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authButton = document.getElementById('authorizeButton');
    authButton.style.display = 'none';
    if (authResult && !authResult.error) {
        authButton.style.display = 'none';
        var query = getUrlVars();
        if (query.folder) {
            downloadFilesFromFolder(query.folder);
        } else if (query.file) {
            downloadFileInfo(query.file);
        } else {
            downloadFiles();
        }
    } else {
        // No access token could be retrieved, show the button to start the authorization flow.
        authButton.style.display = 'block';
        authButton.onclick = function() {
            gapi.auth.authorize({
                'client_id' : CLIENT_ID,
                'scope' : SCOPES,
                'immediate' : false
            }, handleAuthResult);
        };
    }
}

/**
 *  Read a page's GET URL variables and return them as an associative array.
 */
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/*************************************************************** LISTOPS ***************************************************************/

/**
 * Downloads the lists from the server. caches the
 * next page if there is one.
 */
function downloadFiles() {
    if (nextPage) {
        var request = gapi.client.request({
            'path' : '/drive/v2/files',
            'params' : {
                'maxResults' : LIST_SIZE,
                'pageToken' : nextPage,
                'q' : 'sharedWithMe=true',
                'key' : gapi.auth.getToken().access_token
            }
        }).execute(buildTable);
    } else {
        var request = gapi.client.request({
            'path' : '/drive/v2/files',
            'params' : {
                'maxResults' : LIST_SIZE,
                'q' : 'sharedWithMe=true',
                'key' : gapi.auth.getToken().access_token
            }
        }).execute(function(jsonResp, rawResp) {
            nextPage = jsonResp.nextPageToken;
            buildTable(jsonResp, rawResp);
        });
    }
}

/**
 * Downloads the files specific to a folder.
 */
function downloadFilesFromFolder(folderId) {
    var request = gapi.client.request({
        'path' : '/drive/v2/files/' + folderId + '/children',
        'params' : {
            'maxResults' : LIST_SIZE,
            'key' : gapi.auth.getToken().access_token
        }
    }).execute(function(jsonResp, rawResp) {
        var batch = gapi.client.newHttpBatch();
        var table = document.getElementById('fileTableBody');
        for (var i = 0; i < jsonResp.items.length; i++) {
            batch.add(gapi.client.request({
                'path' : '/drive/v2/files/' + jsonResp.items[i].id,
                'params' : {
                    'maxResults' : LIST_SIZE,
                    'key' : gapi.auth.getToken().access_token
                }
            }));
        }
        batch.execute(function(json, raw) {
            var jsonResp = {
                'items' : []
            };
            for (var num in json) {
                jsonResp.items.push(json[num].result);
            }
            buildTable(jsonResp, raw);
        });
    });
}

/**
 * Builds the table rows from the response
 *
 * @param {Object} jsonResp
 * @param {Object} rawResp
 */
function buildTable(jsonResp, rawResp) {
    var fileArray = jsonResp.items;
    var nextPageToken = jsonResp.nextPageToken;
    var table = document.getElementById('fileTableBody');
    for (var i = 0; i < fileArray.length; i++) {
        buildRow(table, fileArray[i]);
    }
}

/**
 * appends a table row for a file object
 *
 * @param {Object} table
 * @param {Object} fileJson
 */
function buildRow(table, fileJson) {
    var row = document.createElement('tr');
    // images
    var iconImg = document.createElement('img');
    var ownerImg = document.createElement('img');
    iconImg.src = fileJson.iconLink;
    iconImg.width = "20";
    iconImg.height = "20";
    ownerImg.src = fileJson.owners[0].picture.url;
    ownerImg.width = "20";
    ownerImg.height = "20";
    // cells
    var iconCell = document.createElement('td');
    var createdCell = document.createElement('td');
    var titleCell = document.createElement('td');
    var ownerCell = document.createElement('td');
    var modifiedCell = document.createElement('td');
    // link
    var fileLink = document.createElement('a');
    fileLink.href = "/drive.php?" + (fileJson.mimeType == "application/vnd.google-apps.folder" ? "folder=" : "file=") + fileJson.id;
    fileLink.appendChild(document.createTextNode(fileJson.title));
    // build cells
    iconCell.align = 'center';
    iconCell.appendChild(iconImg);
    createdCell.appendChild(document.createTextNode(Date.parse(fileJson.createdDate.substring(0, fileJson.createdDate.lastIndexOf("."))).toString("M/d/yy")));
    titleCell.appendChild(fileLink);
    ownerCell.appendChild(ownerImg);
    ownerCell.appendChild(document.createTextNode("    " + fileJson.owners[0].displayName));
    modifiedCell.appendChild(document.createTextNode(Date.parse(fileJson.modifiedDate.substring(0, fileJson.modifiedDate.lastIndexOf("."))).toString("M/d/yy")))
    // build row
    row.appendChild(iconCell);
    row.appendChild(createdCell);
    row.appendChild(titleCell);
    row.appendChild(ownerCell);
    row.appendChild(modifiedCell);
    // build table
    table.appendChild(row);
}

/*************************************************************** FILEOPS ***************************************************************/

/**
 * downloads the metadata for a specific file
 *
 * @param {Object} fileId
 */
function downloadFileInfo(fileId) {
    var batch = gapi.client.newHttpBatch();
    batch.add(gapi.client.request({
                'path' : '/drive/v2/files/' + fileId,
                'params' : {
                    'key' : gapi.auth.getToken().access_token
                }
            }), {
                'callback': buildFileDisplay
            });
    batch.add(gapi.client.request({
                'path' : '/drive/v2/files/' + fileId + '/comments/',
                'params' : {
                    'key' : gapi.auth.getToken().access_token
                }
            }), {
                'callback': buildCommentsSection
            });
    batch.execute();
}

/**
 * builds the display page for the file represented by jsonResp
 *
 * @param {Object} jsonResp
 * @param {Object} rawResp
 */
function buildFileDisplay(jsonResp, rawResp) {
    jsonResp = jsonResp.result;
    // NAME
    var fileHeader = document.getElementById('fileName');
    // var download = document.getElementById('download');
    var dropDownList = document.getElementById('action-dropdown-more');
    // INFO
    var thumbNailCell = document.getElementById('thumbNailCell');
    var ownerCell = document.getElementById('owner');
    var createdCell = document.getElementById('created');
    var modifiedByCell = document.getElementById('modifiedBy');
    var lastModifiedCell = document.getElementById('lastModified');
    // QUCIKVIEW
    var quickViewFrame = document.getElementById('quickViewFrame');
    //build the display page
    var thumbNailImg = document.createElement('img');
    thumbNailImg.src = jsonResp.thumbnailLink;
    thumbNailCell.appendChild(thumbNailImg);
    fileHeader.appendChild(document.createTextNode(jsonResp.title));
    // download.href = jsonResp.downloadUrl
    var ulist = document.createElement('ul');
    for (var linkKey in jsonResp.exportLinks) {
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = jsonResp.exportLinks[linkKey];
        link.target = '_blank';
        link.appendChild(document.createTextNode(linkKey));
        listItem.appendChild(link);
        ulist.appendChild(listItem);
    }
    dropDownList.appendChild(ulist);
    var ownerImg = document.createElement('img');
    ownerImg.src = jsonResp.owners[0].picture.url;
    ownerImg.width = "20";
    ownerImg.height = "20";
    ownerCell.appendChild(ownerImg);
    ownerCell.appendChild(document.createTextNode("    " + jsonResp.owners[0].displayName));
    createdCell.appendChild(document.createTextNode(Date.parse(jsonResp.createdDate.substring(0, jsonResp.createdDate.lastIndexOf("."))).toString("M/d/yy")));
    if(jsonResp.lastModifyingUser.hasOwnProperty('picture')){
        var modifierImg = document.createElement('img');
        modifierImg.src = jsonResp.lastModifyingUser.picture.url;
        modifierImg.width = "20";
        modifierImg.height = "20";
        modifiedByCell.appendChild(modifierImg);
        
    }
    modifiedByCell.appendChild(document.createTextNode("    " + jsonResp.lastModifyingUser.displayName));
    if(jsonResp.hasOwnProperty('modifiedDate')){
        lastModifiedCell.appendChild(document.createTextNode(Date.parse(jsonResp.modifiedDate.substring(0, jsonResp.modifiedDate.lastIndexOf("."))).toString("M/d/yy")));   
    }
    if (jsonResp.mimeType != 'application/pdf') {
        quickViewFrame.src = jsonResp.embedLink;
        var fullEditLink = document.getElementById('fullEdit');
        fullEditLink.href = jsonResp.defaultOpenWithLink;
        fullEditLink.target = '_blank';
    } else {
        var quickViewHeader = document.getElementById('quickViewHeader');
        quickViewHeader.style.display = 'none';
        quickViewFrame.style.display = 'none';
    }
}

/**
 *  builds the comments section from a list of comments on a file.
 *
 * @param {Object} jsonResp
 * @param {Object} rawResp 
 */
function buildCommentsSection(jsonResp, rawResp) {
    jsonResp = jsonResp.result;
    var container = document.getElementById('container');
    var body = document.getElementById('bodyElement');
    container.style.cssFloat = 'left';
    container.style.marginTop = 'auto';
    container.style.marginRight = 'auto';
    container.style.marginBottom = 'auto';
    container.style.marginLeft = '250px';
    var commentsSection = document.createElement('div');
    var commentsHeader = document.createElement('h2');
    var commentDiv = document.createElement('div');
    commentDiv.id = 'ticket_thread';
    commentsHeader.appendChild(document.createTextNode('File Comments'));
    commentsHeader.style.padding = '5px';
    commentsHeader.style.borderBottom = '1px solid #F7F7F7';
    commentsSection.appendChild(commentsHeader);
    commentDiv.appendChild(buildCommentBox());
    if(jsonResp.items.length > 0){
        for(var num in jsonResp.items){
            commentDiv.appendChild(buildCommentTables(jsonResp.items[num]));
        }
    }
    commentsSection.appendChild(commentDiv);
    commentsSection.style.cssFloat = 'right';
    commentsSection.style.width = '400px';
    commentsSection.style.marginTop = '120px';
    commentsSection.style.marginRight = 'auto';
    commentsSection.style.marginLeft = 'auto';
    commentsSection.style.marginBottom = 'auto';
    commentsSection.style.backgroundColor = '#FFFFFF';
    commentsSection.style.minHeight = '1000px';
    body.appendChild(commentsSection);
}

/**
 * refreshes the comments section with data from jsonResp after a comment post.
 *
 * @param {Object} jsonResp
 * @param {Object} rawResp 
 */
function refreshCommentsSection(jsonResp, rawResp){
    var commentDiv = document.getElementById('ticket_thread');
    commentDiv.innerHTML = "";
    commentDiv.appendChild(buildCommentBox());
    if(jsonResp.items.length > 0){
        for(var num in jsonResp.items){
            commentDiv.appendChild(buildCommentTables(jsonResp.items[num]));
        }
    }
}

/**
 * builds a comment div that is filled with comment tables.
 *  
 * @param {Object} comment
 */
function buildCommentTables(comment){
    var commentTable = document.createElement('table');
    var headerRow = document.createElement('tr');
    var bodyRow = document.createElement('tr');
    var userHeader = document.createElement('th');
    var dateHeader = document.createElement('th');
    var userSpan = document.createElement('span');
    var bodyCell = document.createElement('td');
    // build user header
    if(comment.author.hasOwnProperty('picture')){
        var userImage = document.createElement('img');
        userImage.src = comment.author.picture.url;
        userImage.style.height = '30px';
        userImage.style.width = '30px';
        userHeader.appendChild(userImage);
    }
    userSpan.appendChild(document.createTextNode("       " + comment.author.displayName));
    userSpan.style.verticalAlign = '9px';
    userHeader.appendChild(userSpan);
    // build date header
    var timestamp = Date.parse(comment.createdDate.substring(0, comment.createdDate.lastIndexOf(".")));
    dateHeader.appendChild(document.createTextNode(timestamp.add(-5).hours().toString("M/d/yy h:mm tt")));
    dateHeader.className = 'tmeta';
    // build body cell
    bodyCell.appendChild(document.createTextNode(comment.htmlContent));
    bodyCell.colSpan = '2';
    // build header row
    headerRow.appendChild(userHeader);
    headerRow.appendChild(dateHeader);
    // build body row
    bodyRow.appendChild(bodyCell);
    // build table
    commentTable.width = '360';
    commentTable.cellspacing = '0';
    commentTable.cellpadding = '1';
    commentTable.border = '0';
    commentTable.className = 'response';
    commentTable.style.borderCollapse = 'collapse';
    commentTable.style.marginLeft = 'auto';
    commentTable.style.marginRight = 'auto';
    commentTable.appendChild(headerRow);
    commentTable.appendChild(bodyRow);
    
    return commentTable;
}

/**
 * builds the comment box for attaching comments. 
 */
function buildCommentBox(){
    var commentBoxTable = document.createElement('table');
    var messageRow = document.createElement('tr');
    var textBoxRow = document.createElement('tr');
    var submitRow = document.createElement('tr');
    var messageHeader = document.createElement('th');
    var textBoxCell = document.createElement('td');
    var submitCell = document.createElement('td');
    var submitButton = document.createElement('input');
    var textBox = document.createElement('textarea');
    // build the header row
    messageHeader.appendChild(document.createTextNode('Post a Comment'));
    messageRow.appendChild(messageHeader);
    // build the textbox row 
    textBox.cols = '40';
    textBox.rows = '4';
    textBox.placeholder = 'post a comment to the file'
    textBox.id = 'commentBox';
    textBoxCell.appendChild(textBox);
    textBoxRow.appendChild(textBoxCell);
    // build the submit row
    submitButton.onclick = onCommentButtonClick;
    submitButton.value = 'Post Comment';
    submitButton.type = 'button';
    submitButton.className = 'btn_sm';
    submitCell.appendChild(submitButton);
    submitRow.appendChild(submitCell);
    // build the table
    commentBoxTable.width = '360';
    commentBoxTable.cellspacing = '0';
    commentBoxTable.cellpadding = '1';
    commentBoxTable.border = '0';
    commentBoxTable.className = 'response';
    commentBoxTable.style.borderCollapse = 'collapse';
    commentBoxTable.style.marginLeft = 'auto';
    commentBoxTable.style.marginRight = 'auto';
    commentBoxTable.appendChild(messageRow);
    commentBoxTable.appendChild(textBoxRow);
    commentBoxTable.appendChild(submitRow);
    
    return commentBoxTable;
}

/**
 * called when the post comment button is clicked 
 */
function onCommentButtonClick(){
    var textBox = document.getElementById('commentBox');
    var query = getUrlVars();
    var body = {
            'content': textBox.value
    };
    var request = gapi.client.request({
                'path' : '/drive/v2/files/' + query.file + '/comments',
                'method': 'POST',
                'params' : {
                        'key' : gapi.auth.getToken().access_token
                },
                'body': body
            }).execute(function(jsonResp, rawResp){
                gapi.client.request({
                    'path' : '/drive/v2/files/' + query.file + '/comments/',
                    'params' : {
                        'key' : gapi.auth.getToken().access_token
                    }
                }).execute(refreshCommentsSection);
            });
}

