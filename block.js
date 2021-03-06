var Events = require('events');
var Config = require('./config');

module.exports = function Block (params) {

	var instance = new Events.EventEmitter();
	instance.piece = null;
	instance.chunk = null;
	instance.torrentChunk = null; // defines the chunk index for the entire @torrent file, and not just for the parent @piece.
	instance.begin = null;
	instance.length = null;
	instance.data = null;
	instance.storage = 'memory';
	instance.completed = false;
	instance.peers = [];
	instance.allowedPeerCount = Config.Blocks.MAXIMUM_ASSIGNED_PEERS;
	instance.lastRequestTime = null;

	instance.getValue = function (callback) {
		if (!instance.completed) { // block has not yet been downloaded, listen for completed event.
			instance.on('block:completed', function () {
				callback (null, instance.data);
			});
		}
		else { // block has been downloaded.
			if (instance.storage == 'memory') {
				callback (null, instance.data);
			}
			else if (block.storage == 'file') {
				mStorage.readPieceBlock (instance, chunk, callback);
			}	
		}
	};

	// set the block's value, this will notify all listeners that the block has been downloaded.
	instance.setValue = function (data) {
		if (instance.completed) {
			return;
		}

		instance.completed = true;
		instance.data = data;
		instance.emit('block:completed', instance);
		//console.log('block [index: %d][chunk: %d] completed',instance.piece.index, instance.chunk);
	};

	// check wether the block is containing data for a given offset.
	instance.isWithinOffset = function (fileOffset) {
		if (fileOffset > instance.begin && fileOffset < (instance.begin + instance.length)) {
			return true;
		}
		return false;
	};

	// used if piece is corrupted.
	instance.reset = function () {
		instance.data = null;
		instance.completed = false;		
	}

	// to prevent too many peers trying to download the same block.
	instance.isFull = function () {
		if (instance.peers.length >= instance.allowedPeerCount) {
			return true;
		}

		return false;
	};

	for (var member in params) { // initialize
		instance[member] = params[member];
	}

	return instance;
};