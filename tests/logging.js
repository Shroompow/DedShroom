logging = require('../dedshroom/utils/logging.js')

var one = logging.get('one')
var two = logging.get('two')

two.level = logging.LEVEL.DEBUG

console.log('expecting three "show"s')
one.info('show')
one.warning('show')
one.critical('show')
one.debug('hide')
console.log('\n')

console.log('expecting four "show"s')
two.info('show 2')
two.warning('show 2')
two.critical('show 2')
two.debug('show 2')
console.log('\n')

one.info('setting global level to debug, expecting two "debug"s')
logging.level = logging.LEVEL.DEBUG

one.debug('debug')
two.debug('debug')
console.log('\n')

two.debug('setting level of two to critical, expecting a debug log from one')
two.level = logging.LEVEL.CRITICAL

one.debug('this should appear')
two.debug('this should not')
console.log('\n')

two.critical('loading module with different path')
logging2 = require('../../DedShroom/dedshroom/utils/logging.js')

two2 = logging2.get('two')
two2.critical('this should show up')
two2.debug('this should not show up')

one.debug('check if two and two2 are identical')
one.debug(two === two2)
one.debug('check if one and two are identical (they shouldn\'t)')
one.debug(one === two)
console.log('\n')

one.info('setting level to info')
logging.level = logging.LEVEL.INFO
two.resetLevel()

two.info('show')
two2.info('show2')
one.info('show')
console.log('\n')

one.info('silencing two')
two.silence()
one.info('show')
two.info('i am silenced')
two2.info('me too')
console.log('\n')

one.info('unsilencing two')
two.unsilence()
two.info('unsilenced')
two2.info('applies to two2 too')
