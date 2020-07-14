export function mergeObject(state, action) {
    return {...state, ...action.payload};
}

export function mergeArray(state, action) {
    return [...state, ...action.payload];
}
