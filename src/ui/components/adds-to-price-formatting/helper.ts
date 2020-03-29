export default function addsToPriceFormatting([val]) {
    if ( val == 0 ) { return '' };
    return `+ ${val}`;
}
