

'use strict';
const fs = require('fs');
const FormStream = require('formstream');

module.exports = app => {

    /***
     * 所有多媒体文件相关接口参见：https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.6iqrBw&treeId=385&articleId=104971&docType=1
     * @type {string}
     */

    class DdMedia extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        * upload(filePath = __filename) {

            let token = yield this.ctx.service.dd.getToken();

            const form = new FormStream();
            form.file('media', filePath);

            app.logger.info(`DdSns: before upload media to Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/media/upload?access_token=${token}&type=file`, {
                dataType: 'json',
                headers: form.headers(),
                stream: form,
                method: 'POST'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSns: upload media error:`, resultData);
                throw new Error(resultData);
            }
            app.logger.info(`DdSns: end upload media to Dingding`);

            return resultData.media_id;
        }


        * get(mediaId) {
            let token = yield this.ctx.service.dd.getToken();

            app.logger.info(`DdMedia: before get media from Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/media/downloadFile?access_token=${token}&media_id=${mediaId}`, {
                method: 'GET'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdMedia: get media error:`, resultData);
            }
            app.logger.info(`DdMedia: end get media from Dingding`);

            return resultData;
        }

    }

    return DdMedia;
}