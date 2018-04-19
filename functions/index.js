/**
 * Check If the user exists in Intercom. If so it returns an user object. 
 * @param   {Object} userData User Data
 * @param   {Object} intercom Axios instance of Intercom 
 * @returns {Object} user  User object
**/
let intercomGetUser = (() => {
  var _ref = _asyncToGenerator(function* (userData, intercom) {
    try {
      let user = yield intercom.get('/users?email=' + userData.email); // try get user from intercom and return its data If exist.

      return user;
    } catch (e) {
      if (e.response.status === 404) {
        // user do not exist
        return false;
      } else {
        throw new Error(e);
      }
    }
  });

  return function intercomGetUser(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();
/**
 * Create an User in Intercom
 * @param   {Object} userData User Data
 * @param   {Object} intercom Axios instance of Intercom 
 * @returns {Object} user  User object
**/


let intercomCreateUser = (() => {
  var _ref2 = _asyncToGenerator(function* (userData, intercom) {
    try {
      let user = yield intercom.post('/users', userData); // try get user from intercom and return its data If exist.

      return user;
    } catch (e) {
      throw new Error(e);
    }
  });

  return function intercomCreateUser(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let intercomSendMessage = (() => {
  var _ref3 = _asyncToGenerator(function* (userData, message, intercom) {
    try {
      let user = yield intercomGetUser(userData, intercom);

      if (user) {
        const res = yield intercom.post('/messages', message);
        return res;
      } else {
        user = yield intercomCreateUser(userData, intercom);
        const res = yield intercom.post('/messages', message);
        return res;
      }
    } catch (e) {
      throw new Error(e);
    }
  });

  return function intercomSendMessage(_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

const serializeError = require('serialize-error');

const functions = require('firebase-functions');

const axios = require('axios');

const iCredentials = require('./credentials.js').intercom;

let intercom = axios.create({
  baseURL: 'https://api.intercom.io/',
  timeout: 1000,
  headers: {
    'Authorization': 'Bearer ' + iCredentials.token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}); // /**
//  * Responds to any HTTP request that can provide a "message" field in the body.
//  *
//  * @param {Object} req Cloud Function request context.
//  * @param {Object} res Cloud Function response context.
//  */

exports.processForm = functions.https.onRequest((request, response) => {
  // let form = request.body.form_response
  // const answers =getAnswers(form);
  // response.send(answers)
  const userData = {
    email: "m@mail.com",
    name: "Manuel Test 3"
  };
  const message = {
    "from": {
      "type": "user",
      "email": userData.email
    },
    "body": "Hey This is a test, This user already exist.. message continue here"
  };
  return intercomSendMessage(userData, message, intercom).then(res => {
    return response.status(200).send(res);
  }).catch(e => {
    response.send(serializeError(e));
    console.error(serializeError(e));
  });
});
/**
 * Get a typeform response definition object and output an array with the ID
 * @param   {Object} formResponse Typeform form response object
 * @returns {Array} Answers a parsed array of objects with id, title, type, answer 
**/

function getAnswers(formResponse) {
  const fields = formResponse.definition.fields;
  const answers = formResponse.answers; //Parse fields into the resulting array.

  let data = fields.reduce((previous, field) => {
    previous.push({
      id: field.id,
      title: field.title,
      type: "",
      ans: ""
    });
    return previous;
  }, []); // Parse Answers

  data.forEach(field => {
    let ans = answers.find(answer => {
      return answer.field.id === field.id;
    });
    field.type = ans.type;
    field.ans = ans[ans.type];
  });
  return data;
}
