import { randomBytes } from 'crypto'
import Corestore from 'corestore'
import ram from 'random-access-memory'

import { KeyManager } from '@mapeo/crypto'
import { AuthStore } from '@mapeo/core/authstore'
import { Sqlite } from '@mapeo/core/sqlite'

const rootKey = KeyManager.generateRootKey()
const keyManager = new KeyManager(rootKey)
const identityKeyPair = keyManager.getIdentityKeypair()
const identityId = identityKeyPair.publicKey.toString('hex')

const keyPair = keyManager.getHypercoreKeypair(identityId, randomBytes(32))

const corestore = new Corestore(ram, {
    primaryKey: identityKeyPair.publicKey,
})

const projectPublicKey = keyManager.getHypercoreKeypair(
    'project',
    randomBytes(32)
).publicKey

const sqlite = new Sqlite(':memory:')

const authstore = new AuthStore({
    corestore,
    sqlite,
    identityKeyPair,
    keyPair,
    keyManager,
    projectPublicKey,
})

await authstore.ready()
await authstore.initProjectCreator()
const coreOwner = await authstore.getCoreOwner({
    coreId: authstore.id,
})

console.log('coreOwner', coreOwner)

const projectCreator = await authstore.getProjectCreator()

console.log('projectCreator', projectCreator)
