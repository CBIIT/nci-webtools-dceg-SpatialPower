/**
 * Given an input event, returns the name of the control and its new value
 * @param {InputEvent} event 
 */
export function getInputEventValue(event) {
    let {checked, name, type, value} = event.target;
    switch (type) {
        case 'checkbox':
            return {name, value: Boolean(checked)};
        case 'number':
            return {name, value: Number(value)};
        default:
            return {name, value};
    }
}