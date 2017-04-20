var rpc = require('./../lib/binrpc.js');

require('should');


describe('client server disconnect', function () {

    it('should time out', function (done) {
        this.timeout(60000);
        var rpcServer = rpc.createServer({host: '127.0.0.1', port: 2039});
        var rpcClient = rpc.createClient({host: '127.0.0.1', port: 2039});
        rpcServer.on('veryslow', function (err, params, callback) {
            setTimeout(function () {
                callback(null, '');
            }, 10000);
        });
        rpcClient.methodCall('veryslow', [''], function (err, res) {
            err.toString().should.equal('Error: timeout');
            done(err ? undefined : new Error(''));
        });
    });


    it('should reconnect when the server is back', function (done) {
        this.timeout(30000);
        var rpcServer2 = rpc.createServer({host: '127.0.0.1', port: 2038});
        var rpcClient2 = rpc.createClient({host: '127.0.0.1', port: 2038});

        setTimeout(function () {
            rpcClient2.socket.end();
            rpcClient2.socket.destroy();
            rpcServer2.server.close();
            rpcServer2.server.unref();

            setTimeout(function () {
                rpcServer2 = rpc.createServer({host: '127.0.0.1', port: 2038});
                rpcServer2.on('back', function (err, params, callback) {
                    callback(null, 'isBack');
                });
                setTimeout(function () {
                    rpcClient2.methodCall('back', [''], function (err, res) {
                        if (err) {
                            done(err);
                        } else if (res === 'isBack') {
                            done();
                        } else {
                            done(new Error(''));
                        }
                    });
                }, 2750);
            }, 5000);
        }, 5000);

    });
});
