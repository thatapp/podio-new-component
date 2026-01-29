'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Complete Task
 * https://developers.podio.com/doc/tasks/complete-task-22432
 * POST /task/{task_id}/complete
 *
 * Marks the task as completed.
 */
exports.process = async function completeTask(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);

    const taskId = msg.body.task_id || msg.body.taskId || msg.body.TaskId;

    if (!taskId) {
        throw new Error('task_id is required');
    }

    try {
        // Build URL with query params
        const hook = cfg.hook !== false ? 1 : 0;
        const silent = cfg.silent === true ? 1 : 0;
        const url = `/task/${taskId}/complete?hook=${hook}&silent=${silent}`;

        console.log(`Completing task: ${taskId}`);

        const task = await podio.post(url, {});

        helper.emitData(cfg, task, that);
    } catch (error) {
        console.error('completeTask failed:', error.message || error);
        await that.emit('error', error);
    }
};
