'use strict';

var schedule = require('node-schedule');

schedule.scheduleJob('10 0 0 * * *', function () {
  console.log('0点0分10秒 定时任务占位');
});

module.exports = schedule;
