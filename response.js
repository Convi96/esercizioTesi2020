const constants = require("./constants/constants");
const db = require('./db/queries');
const { getErrorCodeFromString, checkPlaceholderError } = require('./utils');

const config = require('./config/config');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const sessionId = uuid.v4();
const sessionClient = new dialogflow.SessionsClient({credentials: require(config.CREDENTIAL_PATH)});;
const sessionPath = sessionClient.projectAgentSessionPath(config.PROJECT_ID, sessionId);

export async function createResponse(intent, params) {
    console.log(intent)
    switch (intent) {
        case constants.ERROR_INTENT:
            const error = params.ErrorCode;
            const code = getErrorCodeFromString(error)
            const resultError = await db.getRowByError(code.toUpperCase());
            if (resultError == constants.ERROR_DB) {
                return constants.ERROR_DB;
            } else if (resultError.length > 0) {
                const spiegazione = checkPlaceholderError(error, resultError[0][3]);
                return spiegazione;
            }else {
                return constants.ERROR_NOT_FOUND;
            }
        case constants.QUERY_INTENT:
            const query = params.Query;
            const resultQuery = await db.checkQuery(query);
            if (resultQuery == constants.ERROR_DB) {
                return constants.ERROR_DB;
            } else if (resultQuery == constants.CORRECT_QUERY) {
                console.log("ok")
                return constants.CORRECT_QUERY;
            } else if (resultQuery.length > 0) {
                const spiegazione = checkPlaceholderError(error, resultQuery[0][3]);
                return spiegazione;
            }else {
                return constants.ERROR_QUERY_NOT_FOUND;
            }
        case constants.WELCOME_INTENT:
            return constants.WELCOME
        case constants.EVENTS_INTENT:
          return constants.EVENTS
        case constants.DB_VERSION_INTENT:
            const version = await db.getDatabaseVersion();
            if (version == constants.ERROR_DB) {
              return constants.ERROR_DB;
            } else {
                return version;
            }
        default:
            return constants.FALLBACK
    }

}

export function generateFullfilmentResponse(text) {
    var obj = {
        "fulfillmentMessages": [
          {
            "text": {
              "text": [
                text
              ]
            }
          }
        ]
      }
    return obj
}

export async function detectIntent(query) {
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: 'it-IT',
        },
      },
    };
    try {
      const responses = await sessionClient.detectIntent(request);
      return responses[0].queryResult.fulfillmentMessages[0].text.text[0];
    } catch (error) {
      return constants.ERROR_DIALOGFLOW;
    }
}