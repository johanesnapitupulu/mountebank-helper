const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const chaiSubset = require('chai-subset');
chai.should();

chai.use(chaiAsPromised);
chai.use(chaiSubset);


// import the mountebank helper library
const mbHelper = require('../src/index');
const Imposter = mbHelper.Imposter;
const Utils = mbHelper.Utils;
const startMbServer = mbHelper.startMbServer;
const fetch = require('node-fetch');


describe('Posting when Mountebank is not running', function () {
  it('postToMountebank should reject when MB is not running', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3000 });
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().should.be.eventually.rejected;
  });

  it('_deleteOldImposter should reject when MB is not running', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3000 });
    testImposter.addRoute(sampleResponse);
    return testImposter._deleteOldImposter().should.be.eventually.rejected;
  });

  it('getImposter should reject when MB is not running', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3000 });
    testImposter.addRoute(sampleResponse);
    return testImposter.getImposter().should.be.eventually.rejected;
  });

  it('deleteImposters should reject when MB is not running', function () {
    return new Utils({}).deleteImposters().should.be.eventually.rejected;
  });

  it('_updateResponse should reject when MB is not running', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3000 });
    testImposter.addRoute(sampleResponse);
    return testImposter._updateResponse(JSON.stringify({ 'Content-Type' : 'application/json' }), 'contentToUpdate', { 'uri' : '/pets/123', 'verb': 'PUT' })
    .should.be.eventually.rejected;
  });
});

describe('Posting to MounteBank', function () {
  before(function startUpMounteBank() {
    return startMbServer(2525);
  });
  it('Should return a resolved promise on a good request', function () {
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3000 });
    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank().should.be.eventually.fulfilled.and.have.property('status').and.equal(201);
  });

  it('Should return a resolved promise with a correct response on a update request', function () {
    const testImposter = new Imposter({ 'imposterPort' : 3001 });
    const sampleResponse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const newBody =  JSON.stringify({ 'updatedAttribute' : 'newValue' });
    const pathToUpdate =  { 'uri' : '/pets/123', 'verb' : 'PUT' };

    testImposter.addRoute(sampleResponse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseBody(newBody, pathToUpdate);
    })
    .then(function (body) {
      return JSON.parse(body);
    })
    .should.be.eventually.fulfilled.and.have.property('port').and.equal(3001);
  });

  it('Should return the correctly updated response body on an update', function () {
    const sampleRespnse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3002 });
    testImposter.addRoute(sampleRespnse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseBody(JSON.stringify({ 'updatedAttribute' : 'newValue' }), { 'uri' : '/pets/123', 'verb' : 'PUT' });
    })
    .then(function (body) {
      return JSON.parse(JSON.parse(body).stubs[0].responses[0].is.body);
    })
    .should.eventually.have.key('updatedAttribute');
  });

  it('Should return the correctly updated response code on an update', function () {
    const sampleRespnse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3002 });
    testImposter.addRoute(sampleRespnse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseCode(201, { 'uri' : '/pets/123', 'verb' : 'PUT' });
    })
    .then(function (body) {
      return JSON.parse(body).stubs[0].responses[0].is.statusCode;
    })
    .should.eventually.equal(201);
  });


  it('Should return the correctly updated headers on an update', function () {
    const sampleRespnse = {
      'uri' : '/pets/123',
      'verb' : 'PUT',
      'res' : {
        'statusCode': 200,
        'responseHeaders' : { 'Content-Type' : 'application/json' },
        'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
      }
    };
    const testImposter = new Imposter({ 'imposterPort' : 3002 });
    testImposter.addRoute(sampleRespnse);
    return testImposter.postToMountebank()
    .then(function () {
      return testImposter.updateResponseHeaders({ 'Content-Type' : 'application/xml' }, { 'uri' : '/pets/123', 'verb' : 'PUT' });
    })
    .then(function (body) {
      return JSON.parse(body).stubs[0].responses[0].is.headers;
    })
    .should.eventually.deep.equal({ 'Content-Type' : 'application/xml' });
  });

  describe('Delete Imposters Test', function () {
    const testUtil = new Utils({});
    before(function startUpMounteBank() {
      testUtil.deleteImposters();
    });
    it('should delete the imposter', function () {
      const sampleRespnse = {
        'uri': '/pets/123',
        'verb': 'GET',
        'res': {
          'statusCode': 200,
          'responseHeaders': {'Content-Type': 'application/json'},
          'responseBody': JSON.stringify({'somePetAttribute': 'somePetValue'})
        }
      };
      const testImposterA = new Imposter({'imposterPort': 3008});
      testImposterA.addRoute(sampleRespnse);
      testImposterA.postToMountebank();
      const testImposterB = new Imposter({'imposterPort': 3009});
      testImposterB.addRoute(sampleRespnse);
      testImposterB.postToMountebank();

      return testUtil.deleteImposters().then((response) => {
        response = JSON.parse(response);
        response.imposters.length.should.equal(2);
        response.imposters[0].port.should.equal(3008);
        response.imposters[1].port.should.equal(3009);
      })
        .catch(error => {
          throw new Error(error);
        });
    });
  });

  describe('Complete Imposter Test', function () {
    it('should return the imposter', function () {
      const sampleRespnse = {
        'uri' : '/pets/123',
        'verb' : 'GET',
        'res' : {
          'statusCode': 200,
          'responseHeaders' : { 'Content-Type' : 'application/json' },
          'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
        }
      };
      const testImposter = new Imposter({ 'imposterPort' : 3009 });
      testImposter.addRoute(sampleRespnse);
      testImposter.postToMountebank();
      return testImposter.getImposter().then((response) => {
        response = JSON.parse(response);
        response.port.should.equal(3009);
        response.stubs[0].predicates[0].matches.method.should.equal("GET");
        response.stubs[0].predicates[0].matches.path.should.equal("/pets/123");
        response.stubs[0].responses[0].is.body.should.equal(JSON.stringify({ 'somePetAttribute' : 'somePetValue' }));
      })
        .catch( error => {
          throw new Error(error);
        });
    });

    it('The correct response is returned when hitting a route on which an imposter is listening on', function () {
      const sampleRespnse = {
        'uri' : '/pets/123',
        'verb' : 'GET',
        'res' : {
          'statusCode': 200,
          'responseHeaders' : { 'Content-Type' : 'application/json' },
          'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
        }
      };
      const testImposter = new Imposter({ 'imposterPort' : 3009 });
      testImposter.addRoute(sampleRespnse);
      return testImposter.postToMountebank()
      .then(function () {
        return fetch('http://localhost:3009/pets/123')
        .then( response => {
          return response.text();
        })
        .then( body => {
          return body.should.equal(JSON.stringify({ 'somePetAttribute' : 'somePetValue' }));
        })
        .catch( error => {
          console.log('error: ');
          console.log(error);
        });
      })
      .catch( error => {
        console.log('error: ');
        console.log(error);
      });
    });
  });
  describe('RegEx matching', function () {
    before( function () {
      const workingWordRegex = '/pets/\\w+/\\w+';
      const anotherResponse = {
        'uri' : workingWordRegex,
        'verb' : 'GET',
        'res' : {
          'statusCode': 200,
          'responseHeaders' : { 'Content-Type' : 'application/json' },
          'responseBody' : JSON.stringify({ 'somePetAttribute' : 'somePetValue' })
        }
      };
      const testImposter = new Imposter({ 'imposterPort' : 3010 });
      testImposter.addRoute(anotherResponse);
      return testImposter.postToMountebank();
    });
    it('Hitting an imposter route setup with regex with a matching path should return the response', function () {
      return fetch('http://localhost:3010/pets/hello/hi')
      .then( response => {
        return response.text();
      })
      .then( body => {
        return body.should.equal(JSON.stringify({ 'somePetAttribute' : 'somePetValue' }));
      });
    });

    it('Hitting an imposter route setup with regex with a non-matching path should return nothing', function () {
      return fetch('http://localhost:3010/pets/hello')
      .then( response => {
        return response.text();
      })
      .then( body => {
        return body.should.equal('');
      });
    });
  });
});
