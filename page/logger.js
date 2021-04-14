/* global logLevels */
/* exported qcLogger */

const buildLogger = () => {
  const logger = {}
  for (const level of logLevels) {
    logger[level] = log => browser.runtime.sendMessage({
      command: 'log',
      data: {
        log,
        level: 'info'
      }
    })
  }
  return logger
}

const qcLogger = buildLogger()
