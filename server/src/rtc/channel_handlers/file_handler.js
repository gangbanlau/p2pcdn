var Handler = require('./handler');
var messages = require('../messages');
var ErrorResponse = messages.response.Error;
var GetChunkRequest = messages.request.GetChunk;

class FileHandler extends Handler {
    get _fileHandler() {
        return this.app.fileHandler;
    }

    get _file() {
        var self = this;
        return self._fileHandler.get(self.request.uuid).catch(function(err) {
            var errorResponse;
            if(err && err.isNotExist) {
                errorResponse = new ErrorResponse(ErrorResponse.Code.UUID_NOT_FOUND);
            } else {
                errorResponse = new ErrorResponse(ErrorResponse.Code.UNKNOWN);
            }
            throw errorResponse;
        });
    }
}

export default FileHandler;
