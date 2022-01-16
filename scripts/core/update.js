function updateMutableValue(mutable, newValue, internal){
    const bridge = internal.bridges[mutable.name];

    switch (mutable.type) {
        case 'string': {
            mutable.value = bridge ? String(bridge(newValue, internal)) : String(newValue || '');
            break;
        }
        case 'number': {
            const inputNumber = Number(newValue);
            mutable.value = bridge ? Number(bridge(inputNumber, internal)) : inputNumber;
            break;
        }
        case 'button': {
            bridge && bridge(newValue || mutable.value, internal);
            break;
        }
        default: {
            error($this, 'An error occured on the node above!');
            throwError(
                `The mutable type is incorrect! It's provided "${mutable.type}".\n
                The only mutable types allowed is:\n
                'string'\n
                'number'\n
                'object'\n
                'array'\n
                'button'\n
                'html'\n
                'component'\n`,
                `Please check the value mutable "${mutable.name}.`
            );
        }
    }
}

function updateDOM(mutable){
    const $mutableNode = $(`[mutable-id='${mutable.ID}']`);

    $mutableNode.length && $mutableNode.map(function (_, node) {
        const $node = $(this);

        switch (node.nodeName) {
            case 'INPUT':
            case 'SELECT': {
                $node.val(mutable.value);
                break;
            }
            case 'BUTTON': {
                break;
            }
            default: {
                switch(mutable.type){
                    case 'button': {
                        break;
                    }
                    default: {
                        $node.html(mutable.value);
                    }
                }
            }
        }
    });
}

export default {
    updateMutableValue,
    updateDOM
}
