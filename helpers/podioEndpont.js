const Podio = require('../podio');

exports.podioDelete = (cfg, param) => {
  const podio = new Podio(cfg);
  return podio.delete('/hook/' + param);
};