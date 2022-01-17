import scripts from '../../scripts';
import utils from '../../utils';
import {MutableListen} from '../../models';

const getFromDomMethods = {
    string: ($this)=>{
        const newValue = $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text() || '';
        return newValue;
    },
    number: ($this, mutableName)=>{
        const {checkType} = scripts.validation;
        const {throwError} = utils.logs;
        let parsed = $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text();
        let number = Number(parsed.replaceAll(' ', ''));

        if(checkType(number) !== 'number') throwError(
            `The value provided isn't resulting in a number!`,
            `Please check the value mutable "${mutableName}".`
        );

        return number;
    }
}

function getDataFromDOM(internal, $this, mutableName, mutableType){
    const {throwError, error} = utils.logs;
    const bridge = internal.bridges[mutableName];
    let mutableValue;

    switch (mutableType) {
        case 'string': {
            const value = getFromDomMethods.string($this, mutableName);
            mutableValue = bridge ? bridge(value, internal) : value;
            break;
        }
        case 'number': {
            const value = getFromDomMethods.number($this, mutableName);
            mutableValue = bridge ? bridge(value, internal) : value;
            break;
        }
        case 'object': {
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
                `The mutable type is incorrect! It's provided "${mutableType}". \n
                The only mutable types allowed is:\n
                'string'\n
                'number'\n
                'object'\n
                'array'\n
                'button'\n
                'html'\n
                'component'`,
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
        const currentEvents = getJQueryEvents($this);

        if(!currentEvents || !currentEvents[current]){
            $this.on(current, (ev)=>{
                internal.update(mutable.name, ev.target.value);
            });
        }
    });
}

function initDependencies($this, mutable){
    const dependenciesAttr = $this.attr('mutable-dependencies');

    if(dependenciesAttr){
        const parsed = dependenciesAttr.split(',');

        mutable.dependencies = parsed;
    }
}

function getJQueryEvents($this){
    const matchedProp = $this.length && Object.keys($this[0]).find(current=>{
        const match = current.match('jQuery');
        if(match && match.length && match.index === 0){
            return $this[0][current];
        }
    });

    return matchedProp && $this[0] && $this[0][matchedProp] && $this[0][matchedProp].events;
}

export default {
    getDataFromDOM,
    treatListeners,
    addListeners,
    initDependencies
}
