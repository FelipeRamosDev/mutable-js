function log(input, ref = ''){
    console.log('\nMutableJS:', input, ref ? '\nReference: ' + ref + '\n' : '');
}

function error(input, ref){
    console.error('\nMutableJS:', input, ref ? '\nReference: ' + ref + '\n' : '')
}

function warn(input, ref){
    console.warn('\nMutableJS:', input, ref ? '\nReference: ' + ref + '\n' : '')
}

function throwError(msg = '', ref = ''){
    throw new Error('\nMutableJS: ' + msg + '\n' + (ref ? 'Tip: ' + ref + '\n' : ''));
}

export default {
    log,
    error,
    warn,
    throwError,
}
