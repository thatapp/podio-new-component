'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');
const axios = require('axios');

exports.process = async function getActualFile(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const { FileId, rawData } = msg.body;

    if (!FileId) {
        throw new Error('File_id field is required');
    }

    // Get file metadata from Podio (includes download link)
    const fileMeta = await podio.get('/file/' + FileId);

    if (!fileMeta || !fileMeta.link) {
        throw new Error('Could not retrieve file metadata or download link from Podio');
    }

    // If rawData is requested, download the actual file content
    if (rawData && rawData.toLowerCase() === 'yes') {
        try {
            const response = await axios.get(fileMeta.link, {
                headers: {
                    'Authorization': 'OAuth2 ' + cfg.oauth.access_token
                },
                responseType: 'arraybuffer'
            });

            const base64Content = Buffer.from(response.data).toString('base64');

            const result = {
                file_id: fileMeta.file_id,
                name: fileMeta.name,
                link: fileMeta.link,
                mimetype: fileMeta.mimetype,
                size: fileMeta.size,
                content_base64: base64Content
            };

            helper.emitData(cfg, result, that);
        } catch (error) {
            throw new Error('Failed to download file content: ' + (error.message || error));
        }
    } else {
        // Return file metadata with download link
        helper.emitData(cfg, fileMeta, that);
    }
};
