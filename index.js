$(document).ready(function() {

  const views = {
    login: $('#login-view'),
    training: $('#training-view'),
    messages: $('#messages-view')
  };

  // Hide all of the views before displaying another view
  function hideAll() {
    views.login.hide();
    views.training.hide();
    views.messages.hide();
    views.login.css('visibility', 'hidden');
    views.training.css('visibility', 'hidden');
    views.messages.css('visibility', 'hidden');
  }

  // Hide all other views and show the view passed
  // view should be a jQuery selector
  function showView(view) {
    hideAll();
    view.show();
    view.css('visibility', 'visible');
  }

  // Initially just show the login view
  function init() {
    showView(views.login);
  }

  init();

});
