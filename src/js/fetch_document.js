var _ = require('lodash');
var cheerio = require('cheerio');
var googleapis = require('googleapis');
var docMarkup = require('google-docs-markup');
var Promise = require('bluebird');
var smartypants = require('smartypants');


var scopes = ['https://www.googleapis.com/auth/drive.readonly'];


const singleDepthPrefixes = {
  'h1': '# ',
  'h2': '## ',
  'h3': '### ',
  'h4': '#### ',
  'p': '',
};


const reservedTextItems = {
  '#': function(remainder) { return 'heading-1: ' + remainder },
  '##': function(remainder) { return 'heading-2: ' + remainder },
  '###': function(remainder) { return 'heading-3: ' + remainder },
  '####': function(remainder) { return 'heading-4: ' + remainder },
  '***': function() { return 'tribull: ***' },
};


const inlineFormats = {
  bold: function(rawText) {
    return '**' + rawText + '**';
  },
  italicize: function(rawText) {
    return '_' + rawText + '_';
  },
  link: function(rawText, linkURL) {
    return '[' + rawText + '](' + linkURL + ')';
  }
};


const authorize = function(credentialHash) {
  var credentials = new googleapis.auth.JWT(
    credentialHash.clientEmail,
    null,
    credentialHash.privateKey,
    scopes,
    null
  );

  return new Promise(function (resolve, reject) {
    credentials.authorize(function(err, tokens) {
      if (err) { reject(err); }

      resolve(credentials);
    });
  });
};


const loadDocument = function(credentials, docID) {
  var drive = googleapis.drive('v2');

  return new Promise(function (resolve, reject) {
    drive.files.export(
      {
        auth: credentials,
        fileId: docID,
        mimeType: 'text/html'
      },
      function(err, response) {
        if (err) { reject(err); }

        resolve(response);
      }
    );
  })
};


const parseDocument = function(credentialHash, docID) {
  return new Promise(function(resolve, reject) {
    var authorization = authorize(credentialHash);

    authorization.then(
      function(credentials) {
        var documentLoader = loadDocument(credentials, docID);
        documentLoader.then(
          function(documentHTML) {
            resolve(documentHTML);
          },
          function(errorText) {
            console.log('Error fetching document: ' + errorText);
            reject(errorText);
          }
        );
      },
      function(errorText) {
        console.log('Authentication error: ' + errorText);
        reject(errorText);
      }
    );
  });
};

const convertToArchieML = function(documentHTML) {
  let lines = [];

  const domTree = cheerio.load(documentHTML);

  // First, parse items in tables.
  const tableContents = domTree('table > tbody > tr > td').each(function() {
    const tableInnerHTML = domTree(this).html();

    lines = lines.concat(
      nodeMapToMarkdown(docMarkup.parse_google_docs_html(tableInnerHTML))
    );
  });

  // Parse the body of the file.
  lines.push('[+body]');

  lines = lines.concat(
    nodeMapToMarkdown(
      docMarkup.parse_google_docs_html(documentHTML)
    )
  );

  lines.push('[]');

  return lines;
};

const nodeMapToMarkdown = function(nodeMap) {
  const lines = [];
  for (let i = 0; i < nodeMap.length; i++) {
    const nodeObj = nodeMap[i];

    if (_.includes(['ul', 'ol'], nodeObj.type)) {
      for (let j = 0; j < nodeObj.blocks.length; j++) {
        const nodeBlock = nodeObj.blocks[j];

        const header = (nodeObj.type === 'ol') ? (j + 1) + '.  ' : '-   ';

        const parsedBlockText = parseBlock(nodeBlock);

        lines.push(header + parsedBlockText);
      }
    } else if (_.includes(_.keys(singleDepthPrefixes), nodeObj.type)) {
      const nodeLine = singleDepthPrefixes[nodeObj.type] + parseBlock(nodeObj)
      const firstWord = nodeLine.split(' ')[0];

      if (_.includes(_.keys(reservedTextItems), firstWord)) {
        const remainingWords = _.drop(nodeLine.split(' ')).join(' ');
        lines.push(reservedTextItems[firstWord](remainingWords));
      } else {
        lines.push(nodeLine);
      }
    } else {
      console.log(nodeObj.type);
    }
  }

  return lines;
}

const parseBlock = function(rawBlock) {
  const blockParts = [];

  for (let i = 0; i < rawBlock.texts.length; i++) {
    const textItem = rawBlock.texts[i];

    let finalText = smartypants.smartypants(
      textItem.text
        .replace(/“|”/g, '"')
        .replace(/‘|’/g, '\'')
        .replace(/—/g, '--')
        .replace(/…/g, '...'),
      1
    );

    if (_.has(textItem, 'italic') && (textItem.italic === true)) {
      finalText = inlineFormats.italicize(finalText);
    }

    if (_.has(textItem, 'bold') && (textItem.bold === true)) {
      finalText = inlineFormats.bold(finalText);
    }

    if (_.has(textItem, 'href') && (textItem.href.length > 0)) {
      // blockParts.push(finalText);
      finalText = inlineFormats.link(finalText, textItem.href);
    }

    blockParts.push(finalText);
  }

  return blockParts.join('');
}


module.exports = {
  authorize: authorize,
  loadDocument: loadDocument,
  parseDocument: parseDocument,
  nodeMapToMarkdown: nodeMapToMarkdown,
  convertToArchieML: convertToArchieML,
}
