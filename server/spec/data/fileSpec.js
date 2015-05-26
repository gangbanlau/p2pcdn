
var fs = require('fs'),
    file = require('../../dist/data/file.js'),
    constants = require('../../dist/constants.js'),
    temp = require('temp'),
    mockery = require('mockery')
;

describe('file.File', function() {
    var testDir;

    beforeEach(function(cb) {
        temp.track();
        testDir = temp.mkdir('filetest', function(err, dirPath) {
            testDir = dirPath;
            if(err) {
                cb(err);
            }
            cb();
        });
    });

    afterEach(function(cb) {
        temp.cleanup(cb);
    });

    it('should throw an error if the constructor is initialized without new', function() {
        expect(function() {file.File(testDir)}).toThrow();
    });

    describe('when no file is present', function() {
        var f,
            fName;

        beforeEach(function () {
            fName = testDir + '/test.txt';
            f = new file.File(fName);
        });


        it('should throw an error', function () {
            expect(function () {
                f.numChunks
            }).toThrow();
        });
    });

    describe('when a directory is set to the file path', function() {
        var f;

        beforeEach(function() {
            f = new file.File(testDir);
        });

        it('should throw an error if a directory exists on the given file location', function() {
            expect(function() {f.numChunks}).toThrow();
        });

    });

    describe('when file is present', function() {
        var f,
            fName,
            chunks,
            createChunk = function(character, chunkSize) {
                chunkSize = chunkSize || constants.CHUNK_SIZE;
                var chunk = "";
                for(var chunkIndex = 0; chunkIndex < chunkSize; chunkIndex++) {
                    chunk += String(character);
                }
                return chunk;
            };

        beforeEach(function () {
            fName = testDir + '/test.txt';
            chunks = [];

            for(var i = 0; i < 10; i++) {
                chunks.push(createChunk(i));
            }

            fs.writeFileSync(fName, chunks.join(''));
            f = new file.File(fName);
        });

        describe('numChunks', function() {

            it('should return the correct number of chunks', function() {
                expect(f.numChunks).toEqual(10);
            });

            it('should return the correct number of chunks when uneven', function() {
                chunks = [];
                chunks.push(createChunk('a'));
                chunks.push(createChunk('b', constants.CHUNK_SIZE-2));

                fs.writeFileSync(fName, chunks.join(''));
                expect(f.numChunks).toEqual(2);
            });

        });

        describe('chunks', function() {

            it('should throw an error if a too high chunk number is passed', function() {
                expect(function() {f.chunk(11)}).toThrow();
            });

            it('should throw an error if negative chunk number is passed', function() {
                expect(function() {f.chunk(-1)}).toThrow();
            });

            it('should return the correct chunk', function(cb) {
                f.chunk(1).then(function(data) {
                    expect(data).toEqual(createChunk("1"));
                    cb();
                }, function(err) {
                    cb(err);
                });
            });

            it('should return data who does not align to chunk sizes', function() {
                chunks = [];
                chunks.push(createChunk('a'));
                chunks.push(createChunk('b', constants.CHUNK_SIZE-2));

                fs.writeFileSync(fName, chunks.join(''));

                f.chunk(1).then(function(data) {
                    expect(data).toEqual(createChunk('b', constants.CHUNK_SIZE-2));
                    cb();
                }, function(err) {
                    cb(err);
                });
            });


            describe('on read stream error', function() {
                var events;
                beforeEach(function() {
                    mockery.enable();

                    events = {};
                    var fsMock = {
                        createReadStream: function(path, options) {
                            return {
                                on: function(name, func) {
                                    events[name] = events[name] || [];
                                    events[name].push(func);
                                }
                            }
                        },
                        statSync: function() {
                            return {
                                size: constants.CHUNK_SIZE*10,
                                isFile: function() {
                                    return true;
                                }
                            }
                        }
                    };
                    mockery.registerMock('fs', fsMock);
                    f = new file.File('test.txt');
                });

                afterEach(function() {
                    mockery.deregisterAll();
                    mockery.disable();
                });

                it('should notify with an error', function() {
                    f.chunk(0).then(function() {
                        expect('should not').toEqual('be called');
                    }, function(err) {
                        expect(err.toString()).toEqual('Error: Internal error')
                    });

                    events["error"].forEach(function(func) {
                        func(new Error('Internal error'));
                    });
                });
            });

        });
    });

});