$(document).on('request-training', function(event, dataExportDirectory) {

  router.showTrainingView();
  setTimeout(function() {
    narcissus.trainWithFacebookMessages(dataExportDirectory);
    router.showChat();
  }, 100);

});
