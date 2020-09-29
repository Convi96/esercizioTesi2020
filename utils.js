export function getErrorCodeFromString(string) {

    const regex = /[a-zA-Z0-9]*-[0-9]{5}/g;
    const found = string.match(regex);
    if (found.length > 0) {
        return found[0];
    }
    
}

export function checkPlaceholderError(error, spiegazione) {

    var spiegazione_final = spiegazione;
    
    if (spiegazione_final.indexOf('%placeholder%') > -1) {
        const regex = /'.*'/g;
        const found = error.match(regex);
        if (found && found.length > 0) {
            const string = found[0];
            spiegazione_final = spiegazione_final.replace('%placeholder%',string)
        }
    }

    return spiegazione_final

}