

export async function postJSON(url, data) {

    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (response.ok) {
        return await response.json()
    } else {
        throw(await response.text());
    }
}