'use strict';

const Podio = require('../../../podio');
const helper = require('../../../helpers/itemHelper');

/**
 * Assign Task
 * https://developers.podio.com/doc/tasks/assign-task-22412
 * POST /task/{task_id}/assign
 *
 * Assigns the task to another user. The task reference will automatically
 * be set to the user's profile if not already assigned.
 */
exports.process = async function assignTask(msg, cfg) {
    const that = this;
    const podio = new Podio(cfg);
    const input = msg.body;

    const taskId = input.task_id || input.taskId || input.TaskId;

    if (!taskId) {
        throw new Error('task_id is required');
    }

    if (!input.responsible) {
        throw new Error('responsible is required (user_id to assign the task to)');
    }

    try {
        const payload = {
            responsible: input.responsible
        };

        const url = `/task/${taskId}/assign`;
        console.log(`Assigning task ${taskId} to user ${input.responsible}`);

        const task = await podio.post(url, payload);

        helper.emitData(cfg, task, that);
    } catch (error) {
        console.error('assignTask failed:', error.message || error);
        await that.emit('error', error);
    }
};
