

export async function fetchJSON(url, params) {
    const response = await fetch(url, {
        ...params,
        headers: {
            ...(params ? params.headers : null), 
            'Content-Type': 'application/json',
            'Accept': 'applciation/json',
        },
    });

    const output = await response.json();

    if (response.ok) {
        return output;
    } else {
        throw(output);
    }
}

export async function postJSON(url, data) {
    return await fetchJSON(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}