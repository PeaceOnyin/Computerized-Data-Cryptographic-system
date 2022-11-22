import { useState } from "react"

const generatekey = async () => {
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  )
  return keyPair
}

function getMessageEncoding(text) {
  let enc = new TextEncoder()
  return enc.encode(text)
}

function encryptMessage(publicKey, text) {
  let encoded = getMessageEncoding(text)
  return window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encoded,
  )
}

export async function copyTextToClipboard(text) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand("copy", true, text)
  }
}

function decryptMessageWithKey(privateKey, ciphertext) {
  return window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, ciphertext)
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

function importPrivateKey(pem) {
  // fetch the part of the PEM string between header and footer
  const pemHeader = "-----BEGIN PRIVATE KEY-----"
  const pemFooter = "-----END PRIVATE KEY-----"
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents)
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString)

  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  )
}

async function exportCryptoKey(key) {
  const exported = await window.crypto.subtle.exportKey("pkcs8", key)
  const exportedAsString = ab2str(exported)
  const exportedAsBase64 = window.btoa(exportedAsString)
  return exportedAsBase64
}

export default function Home() {
  const [encrytMessage, setEncryptMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeMenu, setActiveMenu] = useState("encode")
  const [privateKey, setPrivateKey] = useState("")

  //decipher states
  const [decryptKey, setDecryptKey] = useState("")
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptMessage, setDecryptMessage] = useState("")

  //functions
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!encrytMessage) return
    setIsProcessing(true)
    const key = await generatekey()
    const buffer = await encryptMessage(key.publicKey, encrytMessage)
    let ciphertext = ab2str(buffer)
    let base64Cipher = window.btoa(ciphertext)
    let hashtext = await exportCryptoKey(key.privateKey)
    setPrivateKey(hashtext)
    setEncryptMessage(base64Cipher)
    setIsProcessing(false)
  }

  const handleDecryption = async (e) => {
    e.preventDefault()
    if (!decryptMessage || !decryptKey) return
    setIsDecrypting(true)
    let pem = `-----BEGIN PRIVATE KEY-----
    ${decryptKey}
    -----END PRIVATE KEY-----`
    let hashtext = await importPrivateKey(pem)
    let ciphertext = window.atob(decryptMessage)
    let base64Cipher = str2ab(ciphertext)
    const decipher = await decryptMessageWithKey(hashtext, base64Cipher)
    setDecryptMessage(ab2str(decipher))
    setDecryptKey("")
    setIsDecrypting(false)
  }
  const handleReset = () => {
    setPrivateKey("")
    setEncryptMessage("")
    setDecryptMessage("")
    setDecryptKey("")
    setActiveMenu("encode")
  }
  const handleCopyKey = async () => {
    await copyTextToClipboard(privateKey)
    alert(`key copied successfully`)
  }

  const handleCopyMessage = async () => {
    await copyTextToClipboard(encrytMessage)
    alert(`message copied successfully`)
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-300 w-screen min-h-screen  md:p-20 p-6 ">
      <div className="md:w-2/3 w-full flex flex-col justify-center  items-center rounded-lg shadow-lg p-4 md:p-6 bg-white">
        <header className="flex items-center justify-between w-full h-auto p-6">
          <h1 className="font-bold md:text-4xl text-gray-900">Computerized Data Cryptographic System</h1>
          
        </header>
        <div className="flex-1 w-full p-4 ">
          {activeMenu === "encode" && (
            <form className="flex flex-col w-full space-y-3" onSubmit={handleSubmit}>
              <div className="flex items-center space-x-5">
                <button onClick={() => setActiveMenu("encode")} className={activeMenu === "encode" ? "text-green-500 p-2 shadow-md" : "p-2"}>
                  Encode
                </button>
                <button onClick={() => setActiveMenu("decode")} className={activeMenu === "decode" ? "text-green-500 p-2 shadow-md  " : "p-2"}>
                  Decode
                </button>
              </div>
              {privateKey && <p>copy your encrypted message and key</p>}
              {privateKey && (
                <div className="flex items-center justify-between p-4 border">
                  <p className="flex-1 w-full break-words truncate">{privateKey}</p>
                  <button onClick={handleCopyKey} className="p-4 bg-blue-400 hover:bg-blue-200 rounded-lg  text-white font-bold" type="button">
                    click to copy key
                  </button>
                </div>
              )}
              <textarea 
                className="rounded-lg focus:border-blue-300 w-full p-4 border outline-none"
                rows={15}
                value={encrytMessage}
                onChange={({ target }) => setEncryptMessage(target.value)}
                placeholder="Enter a message to encrypt"
              />
              {!!!privateKey ? (
                <button disabled={isProcessing} className="p-2 md:p-4 bg-blue-400 hover:bg-blue-200 rounded-lg text-white font-bold " type="submit">
                  {isProcessing ? "encrypting..." : "Encrypt"}
                </button>
              ) : (
                <div onClick={handleCopyMessage} className="flex space-x-6">
                  <button className="p-2 md:p-4 bg-blue-400 hover:bg-blue-200 rounded-lg text-white font-bold  " type="button">
                    copy encrypted message
                  </button>
                  <button onClick={handleReset} className="p-2 md:p-4 bg-blue-400 hover:bg-blue-200 rounded-lg text-white font-bold  " type="button">
                    reset
                  </button>
                </div>
              )}
            </form>
          )}
          {activeMenu === "decode" && (
            <form className="flex flex-col w-full space-y-3" onSubmit={handleDecryption}>
              <div className="flex items-center space-x-5">
                <button onClick={() => setActiveMenu("encode")} className={activeMenu === "encode" ? "text-green-500 p-2 shadow-md  " : "p-2"}>
                  Encode
                </button>
                <button onClick={() => setActiveMenu("decode")} className={activeMenu === "decode" ? "text-green-500 p-2 shadow-md   " : "p-2"}>
                  Decode
                </button>
              </div>
              {privateKey && <p>paste your encrypted message and key</p>}

              <input
                onChange={({ target }) => setDecryptKey(target.value)}
                value={decryptKey}
                type={"text"}
                placeholder="paste your encryption key here"
                className="w-full p-4 border rounded-lg focus:border-blue-300 outline-none "
              />
              <textarea
                className="rounded-lg focus:border-blue-300 w-full p-4 border outline-none"
                rows={15}
                value={decryptMessage}
                onChange={({ target }) => setDecryptMessage(target.value)}
                placeholder="Enter a message to decrypt"
              />

              {!!decryptKey ? (
                <button disabled={isDecrypting} className="p-2 md:p-4 bg-blue-400 hover:bg-blue-200 rounded-lg text-white font-bold  " type="submit">
                  {isDecrypting ? "decrypting..." : " Decrypt messsage"}
                </button>
              ) : (
                <button onClick={handleReset} className="p-2 md:p-4 bg-blue-400 hover:bg-blue-200 rounded-lg text-white font-bold  " type="submit">
                  Reset
                </button>
              )}
            </form>
          )}
        </div>

      </div>
      
    </div>
  )
}
