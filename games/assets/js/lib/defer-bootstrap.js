window.deferedRequireCalls = [];

window.require = function (reqModules, requireCallback) {
  window.deferedRequireCalls.push({
    modules: reqModules, callback: requireCallback
  });
};

/* Start - Track-min.js */
if (!spindrift) var spindrift = {}; spindrift.setTrackingCookie = function (b) { if (spindrift.track && spindrift.track.blocks) { var a = spindrift.track.blockCssSelector, b = $(b.target); if ((a = b.prevAll(a).attr('id') || b.closest(a).attr('id')) && spindrift.track.blocks[a])document.cookie = [spindrift.track.cookieName, '=', encodeURIComponent(spindrift.track.blocks[a]), '; path=/'].join(''); } };
$(document).ready(function () { if (spindrift.track && spindrift.track.blocks)document.cookie = spindrift.track.cookieName + '=; expires=Fri, 3 Aug 2001 00:00:00 UTC; path=/', $('body').on('click', 'a, :submit', spindrift.setTrackingCookie); });
/* End - Track-min.js */
