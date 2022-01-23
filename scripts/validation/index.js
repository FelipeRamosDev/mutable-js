import utils from '../../utils';
import resources from '../../resources';

const {error} = utils.logs;
const {errorLogs} = resources;

function isEmpty(value){
    const type = typeof value;

    switch(type){
        case 'string': {
            if(value.length) return false;
            break;
        }
        case 'number': {
            if(value >= 0 || value <= 0) return false;
            break;
        }
        case 'object': {
            if(value !== null){
                if(Array.isArray(value) && value.length) return false;
                if(Object.keys(value).length) return false;
            }
            break;
        }
        default: {
            if(value) return false;
        }
    }

    return true;
}

function checkType(value){
    const type = typeof value;

    switch(type){
        case 'string':
        case 'number':
        case 'date': {
            if(type === 'number' && isNaN(value)) return 'NaN'
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
    if(checkType(obj) !== 'object') errorLogs.isPropExistTypePropIsNotAnObject();
    if(checkType(props) !== 'array') errorLogs.isPropExistPropsParamIsNotAnArray();
    let result = true;

    props.map(prop=>{
        if(!obj[prop]){
            error(`Property "${prop}" provided doesn't exist in the object!`, 'Error occured on isPropExist().');
            result = false;
        }
    });

    return result;
}

export default {
    isEmpty,
    isPropExist,
    checkType,
};
