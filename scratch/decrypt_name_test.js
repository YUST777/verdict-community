const Cryptr = require('cryptr');

// From verdict/.env
const ENCRYPTION_KEY = "2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3";
const cryptr = new Cryptr(ENCRYPTION_KEY);

const encryptedName = "d810844072d32e72deb2a3291026cd0e67c15743a89ac0d1679d26f544670649b006ab86118034eda20e61cf09ef0da448be245d77dc1bc90e8f3c8ee1979d856f4133fd0e61502346a628d58bd536fc098e8bdf148b16c1c54b010faca382cb230863884fd0e5d694e0c3a7ff4206be31b6c372e9b8d85391cacd23";

try {
    const decrypted = cryptr.decrypt(encryptedName);
    console.log("Decrypted Name:", decrypted);
} catch (e) {
    console.error("Decryption failed:", e.message);
}
