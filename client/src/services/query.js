

export async function postJSON(url, data) {

    // create shallow copy of data
    let body = {};
    for (let key in data) {
        let value = data[key];

        //  add the key to the object, coercing numeric strings to numbers
        if (value.length && value !== null && value !== undefined)
            body[key] = isNaN(value) ? value : +value;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });

    if (response.ok) {
        return await response.json()
    } else {
        throw(await response.text());
    }
}