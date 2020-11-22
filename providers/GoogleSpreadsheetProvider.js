'use strict';

const {google} = require('googleapis');
const opn = require('open');
const { sheets } = require('googleapis/build/src/apis/sheets');
const { 
  client_id,
  client_secret,
  redirect_uris 
} = require("../config/google").credentials;

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];
// Open an http server to accept the oauth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
function googleSpreadsheetProvider() {
  // Create an oAuth2 client to authorize the API call
  const client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );

  // Generate the url that will be used for authorization
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return {
    open() {
      opn(authorizeUrl, {wait: true});
    },
    authenticate(code) {
      client.getToken(code, (err, tokens) => {
        if (err) {
          console.error('Error getting oAuth tokens:');
          throw err;
        }
        client.credentials = tokens;
      })
    },
    async create(code) {
      this.authenticate(code);
      const resource = {
        properties: {
          title: "Relatório de vendas"
        }
      }

      await sheets.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
      }, (err, spreadsheet) =>{
        if (err) {
          // Handle error.
          console.log(err);
        } else {
          console.log(`Spreadsheet ID: ${spreadsheet.spreadsheetId}`);
        }
      });
    }
  }
}

module.exports = googleSpreadsheetProvider;