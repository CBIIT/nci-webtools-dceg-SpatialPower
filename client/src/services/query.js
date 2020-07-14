

export async function fetchJSON(url, params) {
    const response = await fetch(url, {
        ...params,
        headers: {
            ...(params ? params.headers : null), 
            'Content-Type': 'application/json',
            'Accept': 'applciation/json',
        },
    });

    if (response.ok) {
        return await response.json()
    } else {
        throw(await response.text());
    }
}

export async function postJSON(url, data) {
    return await fetchJSON(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}