const winston = require('winston');
const { transports, format, createLogger } = winston
const { combine, timestamp, json, printf } = winston.format;


const logTime = new Date().toLocaleDateString()

const customLog = printf(({ level, message }) => {
    return `Level:[${ level }] LogTime: [${ logTime }] Message:-[${ message }]`
})
const date = new Date()
const newdate = `${ date.getDate() }-${ date.getMonth() }-${ date.getFullYear() }`

const options = {
    info: {
        level: 'info',
        dirname: 'logs/combined',
        json: true,
        handleExceptions: true,
        maxSize: '10',
        filename: `combined-${ newdate }.log`,
        datePattern: 'YYYY-MM-DD-HH',
    },
    error: {
        level: 'error',
        dirname: 'logs/error',
        json: true,
        handleExceptions: true,
        filename: `error-${ newdate }.log`,
    }
}

const logger = winston.createLogger({
  format: combine(customLog), transports: [
    new transports.File(options.info),
    new transports.File(options.error)
  ]
});

module.exports = logger;