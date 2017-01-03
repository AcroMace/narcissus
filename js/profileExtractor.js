'use strict';

/**
 * A helper class that copies the user's current profile picture
 * in the working directory and returns a list of their
 * previous names
 */

const fs = require('fs');

const PROFILE_PICTURE_FILE = '/photos/profile.jpg';
const COPIED_PROFILE_PICTURE_FILE = 'profile.jpg';
const PROFILE_FILE = '/index.htm';


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

  }

}

module.exports = ProfileExtractor;
