const crypto = require("crypto");
const iv = Buffer.alloc(16).fill(0)

module.exports = {
  keygen: function (key) {
    return Buffer.from(crypto.createHash('sha256').update(key).digest('hex')).subarray(0, 32)
  },
  encrypt: function (text, key) {
    console.log(this.keygen(key))
    let cipher = crypto.createCipheriv("aes-256-cbc", this.keygen(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex") 
  },
  decrypt: function (text, key) {
    console.log(this.keygen(key))
    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", this.keygen(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  },
};
