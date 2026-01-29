'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Incomplete Task
 * https://developers.podio.com/doc/tasks/incomplete-task-22433
 * POST /task/{task_id}/incomplete
 *
 * Marks the task as incomplete (reopens a completed task).
 */
exports.process = async function incompleteTask(msg, cfg) {
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
        const url = `/task/${taskId}/incomplete?hook=${hook}&silent=${silent}`;

        console.log(`Marking task incomplete: ${taskId}`);

        const task = await podio.post(url, {});

        helper.emitData(cfg, task, that);
    } catch (error) {
        console.error('incompleteTask failed:', error.message || error);
        await that.emit('error', error);
    }
};
