import utils from '../../utils';

const {throwError, error} = utils.logs;

const errorLogs = {
    requiredProps: (className = '', propsName = [''])=>{
        throwError(
            `There is a required property missing!`, 
            `Error ocurred in the construction of ${className} on properties "${propsName.join(',')}"`
        );
    },
    setMutableNameDuplicated: (internal, newMutable)=>{
        throwError(
            `The mutable name "${newMutable.name}" already exists! Please use another one!`,
            `This error occured on the set method of "${internal.name}" MutableJS!`
        );
    },
    runBridgeNameDontExist: (mutableName)=>{
        throwError(
            `The mutable bridge "${mutableName}" isn't exist!`
        );
    },
    setBridgeMutableNameDontExist: (mutableName)=>{
        throwError(
            `The mutable "${mutableName}" isn't exist!`, 
            `You need to create a mutable before setting a new bridge!`
        );
    },
    updateMutableNameDontExist: (name, newValue)=>{
        throwError(
            `The mutable "${name}" isn't exist!`, 
            `You're trying to update the value "${newValue}" for the mutable name "${name}"!`
        );
    },
    mutableModelRequiredPropMissing: (internal)=>{
        throwError(
            `There is a required property missing!`, 
            `Error ocurred in the construction of Mutable model "${internal.name}"`
        );
    },
    mutableListenModelRequiredPropsMissing: ()=>{
        throwError(
            `The evName property is required to construct a MutableListen!`
        );
    },
    initGetFromDOMValueIsntNumber: (mutableName)=>{
        throwError(
            `The value provided isn't resulting in a number!`,
            `Please check the value mutable "${mutableName}".`
        );
    },
    mutableTypeIsIncorrect: ($this, mutableType, mutableName)=>{
        error($this, 'An error occured on the node above!');
        throwError(
            `The mutable type is incorrect! It's provided "${mutableType}".
            The only mutable types allowed is:
            'string'
            'number'
            'object'
            'array'
            'button'
            'html'
            'component'`,
            `Please check the value mutable "${mutableName}.`
        );
    },
    mutableNameDontExistRunningDependencies: (filteredDependency)=>{
        throwError(
            `The mutable "${filteredDependency}" isn't exist!`, 
            `You're trying to set the value "${filteredMutable.value}" for the mutable name "${filteredDependency}"!`
        );
    },
    isPropExistTypePropIsNotAnObject: ()=>{
        throwError(
            `Type of provided parameter "obj" isn't an object!`, 
            'Error occured on isPropExist().'
        );
    },
    isPropExistPropsParamIsNotAnArray: ()=>{
        throwError(
            `Type of provided parameter "props" isn't an array! Please provide an array with the name of the required properties.`, 
            'Error occured on isPropExist().'
        );
    
    },
    getMutableNameDontExist: (mutableName)=>{
        throwError(
            `The mutable "${mutableName}" doesn't exist!`
        );
    }
};

export default errorLogs;
