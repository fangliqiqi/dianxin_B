import CryptoJS from 'crypto-js';

export function encrypt(word, keyStr) {
  const key = CryptoJS.enc.Utf8.parse(keyStr);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function format(str) {
  if (str.length >= 16) {
    return str.substring(0, 16);
  }

  let tempStr = str;

  const max = 16 - str.length;
  for (let i = 0; i < max; i += 1) {
    tempStr += 'Y';
  }
  return tempStr;
}

export function passwordStr(params) {
	let { data, type, param, key } = params;
	const result = JSON.parse(JSON.stringify(data));
	if (type === 'Base64') {
		param.forEach((ele) => {
			result[ele] = btoa(result[ele]);
		});
	} else {
		param.forEach((ele) => {
			var data = result[ele];
			key = CryptoJS.enc.Latin1.parse(key);
			var iv = key;
			// 加密
			var encrypted = CryptoJS.AES.encrypt(data, key, {
				iv: iv,
				mode: CryptoJS.mode.CFB,
				padding: CryptoJS.pad.NoPadding,
			});
			result[ele] = encrypted.toString();
		});
	}
	return result;
}

// export function passwordStr(timeStamp, password) {

//   const data = String(timeStamp);
//   const tempOne = parseInt(data.charAt(data.length - 1), 10);
//   const tempTwo = parseInt(data.charAt(data.length - 2), 10);

//   const one = tempOne === 0 ? 1 : tempOne;
//   const two = tempTwo < one ? tempTwo : 0;
//   const three = data.substring(two, one);

//   return encrypt(three + password, format(two + one + three))
// }