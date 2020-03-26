const openpgp = require('openpgp');

const decryptAndVerify = async (cipher, publicKey, privateKey) => {

    const decrypted = await openpgp.decrypt({
        message: await openpgp.message.readArmored(cipher),   // parse armored message
        publicKeys: publicKey.keys,                           // for verification
        privateKeys: privateKey.keys                          // for decryption
    });

    if(!decrypted.signatures[0].valid){
        throw new Error('Signature is not verified')
    }

    return decrypted.data
};

const encryptAndSign = async (message, publicKey, privateKey  ) => {

    const { data: encrypted } = await openpgp.encrypt({
        message: openpgp.message.fromText(message),      // input message that should to be encrypted
        publicKeys: publicKey.keys,                      // for encryption
        privateKeys: privateKey.keys                     // for signing
    });

    return encrypted

};

const generateKey = async (passphrase, name) => {
        // const passphrase = 'super long and hard to guess secret';
       return  await openpgp.generateKey({
            userIds: [{name}],               // some meta information about user
            curve: 'ed25519',                // ECC curve name
            passphrase                       // protects the private key
        });
};

(async () => {

    /*
    * Init step:
    * 1) Generate key pair or import from localstorage
    * 2) decrypt private key
    *
    * */


    /*
    *
    * * Alice side:
    *
    * */
    const alicePassphrase = 'Alice long password';
    const aliceName = 'Alice';

    //Generare object with all needed keys
    const aliceNewKey  = await generateKey(alicePassphrase, aliceName);
    // Here is a string representation of keys
    const alicePrivateKeyString = aliceNewKey.privateKeyArmored;
    const alicePublicKeyString = aliceNewKey.publicKeyArmored;

    //Generate privateKey and publickKey from strings. This should be taken from localstorage
    const alicePrivateKey = await openpgp.key.readArmored(alicePrivateKeyString);
    const alicePublicKey = await openpgp.key.readArmored(alicePublicKeyString);


    /*
    *
    * Bob's side
    *
    * */

    const bobPassphrase = 'Bobs long password';
    const bobName = 'Bob';

    //Generare object with all needed keys
    const bobNewKey  = await generateKey(bobPassphrase, bobName);
    // Here is a string representation of keys
    const bobPrivateKeyString = bobNewKey.privateKeyArmored;
    const bobPublicKeyString = bobNewKey.publicKeyArmored;

    //Generate privateKey and publickKey from strings. This should be taken from localstorage
    const bobPrivateKey = await openpgp.key.readArmored(bobPrivateKeyString);
    const bobPublicKey = await openpgp.key.readArmored(bobPublicKeyString);



    //Decrypt private key by passphrase(should be made only once, while getting the passphrase from localstorage)
    //After init plugin or page refreshing
    //Alice decrypt the private key
    try{
        await alicePrivateKey.keys[0].decrypt(alicePassphrase);
    }catch(e){
        //Alice has incorrect passphrase(she forgot it)
        console.log('incorrect passphrase')
    }

    /*
    * Start communication
    * */
    const messageFromAlice = 'Hello Bob, I miss you, come to me pleeeeeeeease';

    console.log('Original text');
    console.log(messageFromAlice);

    /*
    * We encrypt the message by Bob's public key, so only Bob can decrypt the message by it's private key.
    * And sign message by Alice's private key. So Bob can verify by Alice's public key that this message was sent by Alice.
    * */
    const encryptAndSignedMessageFromAlice =  await encryptAndSign(messageFromAlice, bobPublicKey, alicePrivateKey);

    console.log();
    console.log('Encrypted and signed text:');
    console.log(encryptAndSignedMessageFromAlice);


    //Bob decrypt the private key
    try{
        await bobPrivateKey.keys[0].decrypt(bobPassphrase);
    }catch(e){
        //Bob has incorrect passphrase(he forgot it)
        console.log('incorrect passphrase')
    }


    //Bob is trying to decrypt the mesage by it's own private key and verify message by Alice's public key
    let decryptedAndVerifiedMessageByBob;
    try{
        decryptedAndVerifiedMessageByBob = await decryptAndVerify(encryptAndSignedMessageFromAlice, alicePublicKey, bobPrivateKey);
    }catch (e) {
        /*
        * Here we have errors if the decryption of message was failed, or if the verification is failed
        * */
        console.log('some errors:');
        console.log(e)
    }

    console.log();
    console.log('Decrypted text:');
    console.log(decryptedAndVerifiedMessageByBob);


    /*
    * Let's try to encript message by wrong key
    * */
    const FBIPassphrase = 'Some stupid string';
    const FBIName = 'Dummy';

    const FBINewKey  = await generateKey(FBIPassphrase, FBIName);
    // Here is a string representation of keys
    const FBIPrivateKeyString = FBINewKey.privateKeyArmored;
    const FBIPublicKeyString = FBINewKey.publicKeyArmored;

    //Generate privateKey and publickKey from strings. This should be taken from localstorage
    const FBIPrivateKey = await openpgp.key.readArmored(FBIPrivateKeyString);
    const FBIPublicKey = await openpgp.key.readArmored(FBIPublicKeyString);

    await FBIPrivateKey.keys[0].decrypt(FBIPassphrase);


    console.log();
    console.log();
    console.log('Verification errors:');
    /*
    * Let's try to decrypt the message by wrong private key
    * */
    try{
        decryptedAndVerifiedMessageByBob = await decryptAndVerify(encryptAndSignedMessageFromAlice, alicePublicKey, FBIPrivateKey);
    }catch (e) {
        // Can't decrypt by wrong private key
        console.log('Decryption error:');
        console.log(e)
    }


    /*
    * Let's try to verify message by wrong public key
    * */
    try{
        decryptedAndVerifiedMessageByBob = await decryptAndVerify(encryptAndSignedMessageFromAlice, FBIPublicKey, bobPrivateKey);
    }catch (e) {
        // Can't verify, the message was sent not by trusted point
        console.log('Verification error:');
        console.log(e)
    }

})();

