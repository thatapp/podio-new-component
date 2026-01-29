'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Get Task
 * https://developers.podio.com/doc/tasks/get-task-22413
 * GET /task/{task_id}
 *
 * Returns the task with the given id.
 */
exports.process = async function getTask(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    // Support multiple naming conventions
    const taskId = msg.body.task_id || msg.body.taskId || msg.body.TaskId;

    if (!taskId) {
        throw new Error('task_id is required');
    }

    try {
        const url = `/task/${taskId}`;
        console.log(`Getting task: ${url}`);

        const task = await podio.get(url);

        helper.emitData(cfg, task, that);
    } catch (error) {
        console.error('getTask failed:', error.message || error);
        await that.emit('error', error);
    }
};
