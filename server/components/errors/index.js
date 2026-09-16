'use strict';

var resUtil = require('../../tool/resutil');

module.exports[404] = function pageNotFound(req, res) {
  const payload = resUtil.code404(req.path);
  if (typeof res.sendJson === 'function') {
    return res.sendJson(404, payload);
  }
  return res.status(404).json(payload);
};
