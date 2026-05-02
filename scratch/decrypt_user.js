const Cryptr = require('cryptr');
const cryptr = new Cryptr('2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3');
const val = '3720482090cd1bdb419fd349f51079fb1abf9462e43e69932561c68815e67148c241a584f794062f2569d58a8e3e0909f811858490dff237d0bad534efb8a7828ac96f0ab0d803d15def88abc96b5f4dda4238338f0af6915874c4338b63915a3893f391a50008cb95ca0779c717fe';
try {
    console.log(cryptr.decrypt(val));
} catch (e) {
    console.error(e);
}
