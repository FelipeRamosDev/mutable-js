import scripts from '../../scripts';
import utils from '../../utils';
import {MutableListen} from '../../models';
import resources from '../../resources';

const {errorLogs} = resources;

const getFromDomMethods = {
    string: ($this)=>{
        const newValue = $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text() || '';
        return newValue;
    },
    number: ($this, mutableName)=>{
        const {checkType} = scripts.validation;
        let parsed = $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text();
        let number = Number(parsed.replaceAll(' ', ''));

        // The mutable value here need to result in a number
        if(checkType(number) !== 'number') errorLogs.initGetFromDOMValueIsntNumber(mutableName);
        return number;
    }
}

function getDataFromDOM(internal, $this, mutableName, mutableType){
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
            errorLogs.mutableTypeIsIncorrect($this, mutableType, mutableName);
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
        let mutableListenRef = mutable.listen[current].ref;
        
        if(!mutableListenRef){
            $this.on(current, (ev)=>{
                internal.update(mutable.name, ev.target.value);
            });
            const currentEv = currentEvents[current];
            mutable.listen[current].ref = currentEv && currentEv[currentEv.length - 1];
        } else {
            const filtered = currentEvents[current] && currentEvents[current].find(ev=>ev.handler === mutableListenRef.handler);

            if(!filtered){
                $this.on(current, (ev)=>{
                    internal.update(mutable.name, ev.target.value);
                });
            }
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

    return matchedProp && $this[0] && $this[0][matchedProp] && $this[0][matchedProp].events || {};
}

export default {
    getDataFromDOM,
    treatListeners,
    addListeners,
    initDependencies
}
