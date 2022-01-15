function genCode(size) {
    var chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'W', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'k', 'r', 's', 't', 'u', 'v', 'x', 'y', 'w', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    var charSize = chars.length - 1;
    var result = '';

    for (let i = 0; i < size; i++) {
        let char = (Math.random() * charSize);
        result += chars[Number(char.toFixed(0))];
    }

    return result;
}

export default {
    genCode
}
