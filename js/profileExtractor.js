'use strict';

/**
 * A helper class that copies the user's current profile picture
 * in the working directory and returns a list of their
 * previous names
 */

const fs = require('fs');
const htmlparser = require('htmlparser2');

const PROFILE_PICTURE_FILE = '/photos/profile.jpg';
const COPIED_PROFILE_PICTURE_FILE = 'profile.jpg';
const PROFILE_FILE = '/index.htm';

/**
 * Finite State Machine Enumerators (for names extraction)
 *
 *  -------    h1     ----------------
 * | Start | ------> | GetCurrentName |
 *  -------           ----------------
 *                            |
 *                            | Fetched the name
 *                            V
 *                 ----------------------
 *                | WaitForPreviousNames |
 *                 ----------------------
 *                           /
 *       "Previous Names" string
 *         /
 *        V
 *  -------------          ---------
 * | WaitForName | -----> | GetName |
 *  -------------    li    ---------
 *        |   ^                  |
 *        |   |                  |
 *  </ul> |    ------------------
 *        |     Fetched the name
 *        V
 *      -----
 *     | End |
 *      -----
 */
const START_STATE = 1;
const GET_CURRENT_NAME_STATE = 2;
const WAIT_FOR_PREVIOUS_NAMES_STATE = 3;
const WAIT_FOR_NAME_STATE = 4;
const GET_NAME_STATE = 5;

class ProfileExtractor {

  constructor(dataExportDirectory) {
    this._dataExportDirectory = dataExportDirectory;
  }

  // Copy the profile picture from the archive to the root directory
  copyProfilePicture() {
    fs.createReadStream(this._dataExportDirectory + PROFILE_PICTURE_FILE)
      .pipe(fs.createWriteStream(COPIED_PROFILE_PICTURE_FILE));
  }

  // Fetch the previous names of the user
  fetchNames() {
    let self = this;
    let state = START_STATE;
    let names = [];

    const parser = new htmlparser.Parser({
      onopentag: function (name, attribs) {
        // We are about to receive the user's current name as a text
        if (state === START_STATE && name === 'h1') {
          state = GET_CURRENT_NAME_STATE;
        }
        // We are about to receive a name as a text
        else if (state === WAIT_FOR_NAME_STATE && name === 'li') {
          state = GET_NAME_STATE;
        }
      },
      ontext: function (text) {
        // We are about to receive the user's current name
        if (state === GET_CURRENT_NAME_STATE) {
          names.push(text); // This is the current name
          state = WAIT_FOR_PREVIOUS_NAMES_STATE
        }
        // We are about to receive the list of previous names
        else if (state === WAIT_FOR_PREVIOUS_NAMES_STATE && text === 'Previous Names') {
          state = WAIT_FOR_NAME_STATE;
        }
        // This is a line for one of the names of the user
        else if (state === GET_NAME_STATE) {
          // The name is formatted as "FULL NAME - FIRST NAME - LAST NAME - Numbers?"
          // We are only interested in the full name
          names.push(text.split(' - ')[0]);
          state = WAIT_FOR_NAME_STATE;
        }
      },
      onclosetag: function(name) {
        // We fetched all the names - stop parsing
        if (state === WAIT_FOR_NAME_STATE && name === 'ul') {
          parser.parseComplete();
        }
      }
    }, { decodeEntities: false });

    // Start parsing
    parser.write(fs.readFileSync(this._dataExportDirectory + PROFILE_FILE, 'utf8'));
    parser.end();

    return names;
  }

}

module.exports = ProfileExtractor;
