import {logs} from '../../utils';

const {error, throwError} = logs;

function isEmpty(value){
    const type = typeof value;

    switch(type){
        case 'string': {
            if(value.length) return true;
            break;
        }
        case 'number': {
            if(value >= 0 || value <= 0) return true;
            break;
        }
        case 'object': {
            if(value !== null){
                if(Array.isArray(value) && value.length) return true;
                if(Object.keys(value).length) return true;
            }
            break;
        }
        default: {
            if(value) return true;
        }
    }

    return false;
}

function checkType(value){
    const type = typeof value;

    switch(type){
        case 'string':
        case 'number':
        case 'date': {
            return type;
        }
        case 'object': {
            if(value !== null){
                if(Array.isArray(value)) return 'array';
                return type;
            } else {
                return 'null';
            }
        }
        default: {
            if(value) return true;
        }
    }
}

function isPropExist(obj = {}, props = ['']){
    if(checkType(obj) !== 'object') throwError(
        `Type of provided parameter "obj" isn't an object!`, 
        'Error occured on isPropExist().'
    );
    if(checkType(props) !== 'array') throwError(
        `Type of provided parameter "props" isn't an array! Please provide an array with the name of the required properties.`, 
        'Error occured on isPropExist().'
    );

    props.map(prop=>{
        if(!obj[prop]){
            error(`Property "${prop}" provided doesn't exist in the object!`, 'Error occured on isPropExist().');
            return false
        }
    });

    return true;
}

export default {
    isEmpty,
    isPropExist,
    checkType,
};
