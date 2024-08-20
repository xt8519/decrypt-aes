const btnRecargarSesiones = document.getElementById('btn-recargar-sesiones');
const btnGuardarSesion = document.getElementById('btn-guardar-sesion');
const btnDesencriptar = document.getElementById('btn-desencriptar');
const btnGuardarClave = document.getElementById('btn-guardar-clave');
const txtMensajeEncriptado = document.getElementById('txt-mensaje-encriptado');
const divJsonEditor = document.getElementById('div-json-editor');
const divSesiones = document.getElementById('div-sesiones');

const KEY_CLAVE = 'KEY_CLAVE';

const onClickGuardarSesion = () => {
    console.log('onClickGuardarSesion');
    const keyName = prompt('Ingrese el nombre para guardar');
    if (keyName) {
        const mensajeEncriptado = txtMensajeEncriptado.value;
        localStorage.setItem(keyName, mensajeEncriptado);
        recargarSesiones();
    } else {
        alert('Operación cancelada: No se ingresó un nombre de clave.');
    }
}

const onClickRecargarSesiones = () => {
    console.log('onClickRecargarSesiones');
    recargarSesiones();
}

const onClickGuardarClave = () => { 
    console.log('onClickGuardarClave');
    const clave = prompt('Ingrese la clave para encriptar');
    if (clave) {
        localStorage.setItem(KEY_CLAVE, clave);
        alert(`Se ha guardado la clave correctamente`);
    }
}

const onClickSesion = (key) => {
    console.log('onClickSesion',key);
    const value = localStorage.getItem(key);
    console.log('value',value);
    txtMensajeEncriptado.value = value;
    onClickDesencriptar();
}

const onClickDesencriptar = () => {
    console.log('onClickDesencriptar');
    try {
        divJsonEditor.innerText = '';
        const clave = localStorage.getItem(KEY_CLAVE);
        if (!clave) {
            alert('No se ha guardado la clave');
        } else {
            const mensajeEncriptado = txtMensajeEncriptado.value;
            const decryptedMessage = decryptAES(clave, mensajeEncriptado);
            const jsonObject = JSON.parse(decryptedMessage);
            const jsonOptions = {
                modes: ['code', 'view'],
                
            };
            const editor = new JSONEditor(divJsonEditor, jsonOptions);
            editor.set(jsonObject);
        }
        
    } catch (error) {
        divJsonEditor.innerText = 'Error: ' + error.message;
    }
}

const onClickEliminarSesion = (key) => {
    console.log('onClickEliminarSesion',key);
    const value = prompt(`¿Está seguro de eliminar la sesión ${key}? Escribe un valor para confirmar`);
    if (value) {
        localStorage.removeItem(key);
        recargarSesiones();
    }
    
}

const decryptAES = (password, encryptedMessage) => {
    console.log('decryptAES');
    console.log('password',password);
    console.log('encryptedMessage',encryptedMessage);
    const keySize = 256;
    const iterations = 1;

    const salt = CryptoJS.enc.Hex.parse(encryptedMessage.substr(encryptedMessage.length - 32));
    const iv = CryptoJS.enc.Hex.parse(encryptedMessage.substr(encryptedMessage.length - 64, 32));
    const encrypted = encryptedMessage.substr(0, encryptedMessage.length - 64);

    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keySize / 32,
        hasher: CryptoJS.algo.SHA512,
        iterations: iterations,
    });

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
    });

    const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedMessage) {
        throw new Error('Decrypt Error');
    }

    return decryptedMessage;
}

const recargarSesiones = () => {
    let items = getSesiones(localStorage);
    items = items.filter(item => item.key !== KEY_CLAVE);
    console.log('items',items);
    divSesiones.innerHTML = '';
    if(items.length > 0){
        items.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('flex', 'gap-2');
            let html= `<div class="bg-gray-200 mt-2 w-full hover:bg-gray-100 p-2 rounded cursor-pointer" onclick="onClickSesion('${item.key}')">${item.key}</div>`;
            html+= `<button onclick="onClickEliminarSesion('${item.key}')" class="rounded-lg hover:bg-gray-100"><box-icon size="xs" name='trash'></box-icon></button>`;
            div.innerHTML = html;
            divSesiones.appendChild(div);
        });
    } else {
        divSesiones.innerHTML = `<div>No hay sesiones</div>`;
    }
}



const getSesiones = () => {
    const values = [];
    const keys = Object.keys(localStorage);
    let i = keys.length;
    while ( i-- ) {
        const key = keys[i];
        const value = localStorage.getItem(key);
        if(!key.includes('function(n)')){
            values.push({key, value });
        }
    }
    return values;
}


btnRecargarSesiones.addEventListener('click', onClickRecargarSesiones);
btnGuardarSesion.addEventListener('click', onClickGuardarSesion);
btnDesencriptar.addEventListener('click', onClickDesencriptar);
btnGuardarClave.addEventListener('click', onClickGuardarClave);

recargarSesiones();
