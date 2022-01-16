import scripts from '../../scripts';
import utils from '../../utils';


function getDataFromDOM($this, mutableName, mutableType){
    const {throwError, error} = utils.logs;
    let mutableValue;

    switch (mutableType) {
        case 'string': {
            mutableValue = grabString($this);
            break;
        }
        case 'number': {
            mutableValue = grabNumber($this);
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

function grabString($this){
    return $this.attr('mutable-value') || $this.val() || $this.attr('value') || $this.text() || '';
}

function grabNumber($this){
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

export default {
    getDataFromDOM
}
