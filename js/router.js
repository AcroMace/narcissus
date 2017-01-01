'use strict';

class Router {

  constructor() {
    this.views = {
      directorySelection: $('#directory-selection-view'),
      training: $('#training-view'),
      messages: $('#messages-view')
    };
  }

  showDirectorySelection() {
    this._showView(this.views.directorySelection);
  }

  showTrainingView() {
    this._showView(this.views.training);
  }

  showChat() {
    this._showView(this.views.messages);
  }

  // Hide all of the views before displaying another view
  _hideAll() {
    this.views.directorySelection.hide();
    this.views.training.hide();
    this.views.messages.hide();
    this.views.directorySelection.css('visibility', 'hidden');
    this.views.training.css('visibility', 'hidden');
    this.views.messages.css('visibility', 'hidden');
  }

  // Hide all other views and show the view passed
  // view should be a jQuery selector
  _showView(view) {
    this._hideAll();
    view.show();
    view.css('visibility', 'visible');
  }

}

module.exports = Router;
