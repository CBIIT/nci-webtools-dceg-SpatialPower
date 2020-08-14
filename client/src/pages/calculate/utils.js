/**
 * Given an input event, returns the name of the control and its new value
 * @param {InputEvent} event 
 */
export function getInputEventValue(event) {
    const target = event.target;
    const name = target.name;
    const type = target.type || target.getAttribute('data-type');
    let value = '';

    switch (type) {
        case 'checkbox':
            value = Boolean(target.checked);
            break;
        case 'number':
            value = Number(target.value);
            break;
        case 'number-array':
            value = target.value.split(/[\s,]+/g).map(Number).filter(n => !isNaN(n));
            break;
        default:
            value = target.value;
    }

    return { name, value };
}