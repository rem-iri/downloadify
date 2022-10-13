export const handleError = function (response) {
    if(!response.ok) {
        throw new Error(`Error fetching:`, response)
    }

    return response;
}