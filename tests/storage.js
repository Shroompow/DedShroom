const storage = require('../dedshroom/utils/storage.js')
const logging = require('../dedshroom/utils/logging.js')

const log = logging.get('StorageTest')
log.level = logging.LEVEL.DEBUG

let h = storage.getHandle('test')

// test modification emission
h.access().then((data) => {log.info(JSON.stringify(data))}, (err) => {log.critical(err)})
h.access((data) => {
    data.modified = Date.now()
}).then((data) => {
  log.info(JSON.stringify(data));
}, (err) => {
  log.critical(err)
});


// test user handle
let h2 = storage.getUserHandle('123456')
h2.access((data) => {
  data.test = 'test';
}).then((data) => {
  log.info(JSON.stringify(data));
}, (err) => {
  log.critical(err);
})

// test custom handle
let h3 = storage.getHandle('custom/folders/rule/', 'notrailingslash', 'filename')
h3.access((data) => {data.added = true}).then(() => {log.info('check the folder')}, (err) => {log.critical(err)})

let h4 = storage.getGuildHandle('testguild')
h4.access((data) => {data.added = true}).then(() => {log.info('check the folder')}, (err) => {log.critical(err)})

let h5 = h2.getHandle('test', 'test')
h5.access((data) => {data.added = true}).then(() => {log.info('check the folder')}, (err) => {log.critical(err)})

let h6 = h2.getModuleHandle('testModule')
h6.access((data) => {data.added = true}).then(() => {log.info('check the folder')}, (err) => {log.critical(err)})


// test important flag
let h7 = storage.getHandle(true, 'importantTest', 'test')
h7.access((data) => {data.added = true}).then(() => {log.debug('current cache: ' + JSON.stringify(storage.cache))}, (err) => {log.critical(err)})

let h8 = storage.getHandle('importantTest', 'set afterwards')
h8.access((data) => {data.added = true}).then(() => {log.debug('current cache: ' + JSON.stringify(storage.cache))}, (err) => {log.critical(err)}).then(
  () => {
    log.debug('toggling important')
    h8.toggleImportant()
    log.debug('current cache: ' + JSON.stringify(storage.cache))
    log.debug('setting important to false')
    h8.toggleImportant(false)
    log.debug('current cache: ' + JSON.stringify(storage.cache))
    log.debug('setting to false again')
    h8.toggleImportant(false)
    log.debug('current cache: ' + JSON.stringify(storage.cache))
  })

let h9 = storage.getModuleHandle(false, 'testModule')
h9.access((data) => {data.added = true}).then(() => {log.debug('is cached before purge: ' + h9.isCached())}, (err) => {log.critical(err)}).then(
  () => {
    log.info('purging h9 from cache')
    h9.purge().then(() => {
      log.debug('successfully purged')
      log.debug('is cached after purge: ' + h9.isCached())
    })
  }
)
