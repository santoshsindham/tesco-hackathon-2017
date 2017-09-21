$(document).ready(function () {
  var i = 0;

  for (; i < window.deferedRequireCalls.length; i += 1) {
    window.require.call(window,
      window.deferedRequireCalls[i].modules, window.deferedRequireCalls[i].callback);
  }
});
