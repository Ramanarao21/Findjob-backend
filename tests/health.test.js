const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

test('GET / should return 200 and API health status', (t, done) => {
  const server = http.createServer(app);
  
  server.listen(0, () => {
    const port = server.address().port;
    
    http.get(`http://localhost:${port}/`, (res) => {
      assert.strictEqual(res.statusCode, 200);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const parsed = JSON.parse(data);
        assert.strictEqual(parsed.success, true);
        assert.strictEqual(parsed.message, 'Job Board API is running successfully');
        server.close(done);
      });
    }).on('error', (err) => {
      server.close();
      done(err);
    });
  });
});
