export function getUuid() {

  let rng = getRandomBytes()

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rng[6] = (rng[6] & 0x0f) | 0x40;
  rng[8] = (rng[8] & 0x3f) | 0x80;

  return bytesToUuid(rng)
}

var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf) {
  var i = 0;
  var bth = byteToHex;

  return ([bth[buf[i++]], bth[buf[i++]],
  bth[buf[i++]], bth[buf[i++]], '-',
  bth[buf[i++]], bth[buf[i++]], '-',
  bth[buf[i++]], bth[buf[i++]], '-',
  bth[buf[i++]], bth[buf[i++]], '-',
  bth[buf[i++]], bth[buf[i++]],
  bth[buf[i++]], bth[buf[i++]],
  bth[buf[i++]], bth[buf[i++]]]).join('');
}

function getRandomBytes() {
  let num = Date.now().toString(36) + Math.random().toString(36).slice(-8)
  return toUTF8Array(num)
}

function toUTF8Array(str) {
  let utf8 = []
  for (var i = 0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
        0x80 | (charcode & 0x3f));
    }
    else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10)
        | (str.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f));
    }
  }
  return utf8
}