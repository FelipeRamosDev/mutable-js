import scripts from '../../scripts';
import utils from '../../utils';
import {MutableListen} from '../../models';

const getFromDomMethods = {
    string: ($this)=>{
        return $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text() || '';
    },
    number: ($this)=>{
        const {checkType} = scripts.validation;
        let parsed = $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text();
    
        if(checkType(parsed) === 'string'){
            let number = Number(parsed.replaceAll(' ', ''));
    
            if(checkType(number) !== 'number') throwError(
                `The value provided isn't resulting in a number!`,
                `Please check the value mutable "${mutableName}.`
            );
    
            return number;
        }
    }
}

function getDataFromDOM($this, mutableName, mutableType){
    const {throwError, error} = utils.logs;
    let mutableValue;

    switch (mutableType) {
        case 'string': {
            mutableValue = getFromDomMethods.string($this);
            break;
        }
        case 'number': {
            mutableValue = getFromDomMethods.number($this);
            break;
        }
        case 'array': {
            break;
        }
        case 'button': {
            break;
        }
        case 'html': {
            break;
        }
        case 'component': {
            break;
        }
        default: {
            error($this, 'An error occured on the node above!');
            throwError(
                `The mutable type is incorrect! It's provided "${mutableType}". \nThe only mutable types allowed is:\n'string'\n'number'\n'object'\n'array'\n'button'\n'html'\n'component'\n`,
                `Please check the value mutable "${mutableName}.`
            );
        }
    }

    return mutableValue;
}

function treatListeners(node, mutableType, mutableListen){
    const {isEmpty} = scripts.validation
    const splited = !isEmpty(mutableListen) ? mutableListen.split(',') : [];

    switch(mutableType){
        case 'string':
        case 'number': {
            switch(node.nodeName){
                case 'INPUT':
                case 'TEXTAREA': {
                    return blendListeners(splited, ['keydown', 'keyup', 'change']);
                }
                case 'SELECT': {
                    return blendListeners(splited, ['change']);
                } 
                default: {
                    return splited;
                }
            }
        }
        case 'button': {
            return blendListeners(splited, ['click']);
        }
        default: {
            return splited;
        }
    }
}

function blendListeners(splitedEvents, eventsToBlend){
    const parsed = {};

    splitedEvents.map(item=>{
        parsed[item] = new MutableListen({evName: item});
    });

    eventsToBlend.map(item=>{
        parsed[item] = new MutableListen({evName: item});
    });

    return parsed;
}

function addListeners($this, internal, mutable){
    Object.keys(mutable.listen).map((current)=>{
        $this.on(current, (ev)=>{
            internal.update(mutable.name, ev.target.value);
        });
    });
}

export default {
    getDataFromDOM,
    treatListeners,
    addListeners
}
