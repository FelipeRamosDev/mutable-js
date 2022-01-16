import scripts from '../../scripts';
import utils from '../../utils';

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

export default {
    getDataFromDOM,
}
