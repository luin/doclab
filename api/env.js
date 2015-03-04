GLOBAL.HTTP_ERROR = require('./errors');

var _ = require('lodash');
_.assign(GLOBAL, require('./models'));
