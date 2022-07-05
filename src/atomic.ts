import { JsonRpc } from "eosjs";
import { ObjectSchema, deserialize } from "atomicassets";

import { SchemaObject } from "atomicassets/build/Schema";


interface ICollection { 
    collection_name: string
    author: string
    allow_notify: boolean
    authorized_accounts: string[]
    notify_accounts: string[]
    market_fee: number
    serialized_data: Uint8Array
    ram_payer?: string
}

interface ITemplate {
    template_id: string
    schema_name: string
    transferable: boolean
    burnable: boolean
    max_supply: number
    issued_supply: number
    immutable_serialized_data?: Uint8Array
    mutable_serialized_data?: Uint8Array
    ram_payer?: string
}

interface IAttribute {
    name: string
    type: string
}

interface ISchema {
    schema_name: string
    format: IAttribute[]
}

const rpcUrl = 'https://wax.greymass.com'
const rpc = new JsonRpc(rpcUrl, { fetch });

async function getAllTableRows(request:any, filter?:any) {
    let rows = [] as any
    while ( true ) {
      const res = await rpc.get_table_rows(request) as any
      if ( filter ) {
          rows = [...rows, ...res.rows.filter(filter)]
      }
      else {
        rows = [...rows, ...res.rows]
      }
      if ( res.more ) {
        request.lower_bound = res.next_key
      }
      else {
        break;
      }  
    }
    return rows
}
  
async function getOneTableRow(request:any) {
    const res = await rpc.get_table_rows(request) as any
    if ( res.rows.length ) {
      return res.rows[0]
    }
    else { return false }
}

async function getConfig() {
    let request = {
        json: true,
        code: "atomicassets",
        scope: "atomicassets",
        table: "config",
        limit: 1,
        reverse: false,
        show_payer: false
    }
    return getOneTableRow(request)
}
  
async function getCollectionFilters() {
    let request = {
      json: true,               // Get the response as json
      code: 'atomhubtools',     // Contract that we target
      scope: 'atomhubtools',    // Account that owns the data
      table: 'acclists',        // Table name
      limit: 100,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
    }
  
    const res = await rpc.get_table_rows(request) as any
  
    return res.rows
}
  
async function getCollections(whitelist:string[]) {
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: 'atomicassets',    // Account that owns the data
      table: 'collections',        // Table name
      limit: 100,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
    }
    
    const filter = (c:any) => { return whitelist.includes(c.collection_name)}
    const collections = await getAllTableRows(request,filter)

    const decoded = []
    for ( const c of collections ) {
        if ( ! c ) {
            console.log('A non-collection was found in the collections list.')
            continue
        }
        const dc = await decodeCollection(c)
        decoded.push( dc )
    }
    return decoded;
}
  
async function getCollection(collection:string) {
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: 'atomicassets',    // Account that owns the data
      table: 'collections',        // Table name
      limit: 1,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
      lower_bound: collection,
      upper_bound: collection 
    }
    const coll = await getOneTableRow(request)

    if ( ! coll ) {
        console.log('The collection could not be found.')
        return
    }
    return await decodeCollection(coll)
}

async function getCollectionArray(collection:string) {
    return [ await getCollection(collection) ]
}
  
async function getSchemas(collection:string) {
    let rows = []
  
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: collection,    // Account that owns the data
      table: 'schemas',        // Table name
      limit: 100,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
      lower_bound: ''
    }

    const schemas = await getAllTableRows(request)

    return schemas.map((s:any) => { s.collection = {collection_name: collection}; return s; })
}
  
async function getSchema(collection:string,schema_name:string) {
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: collection,    // Account that owns the data
      table: 'schemas',        // Table name
      limit: 1,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
      lower_bound: schema_name,
      upper_bound: schema_name 
    }
  
    return await getOneTableRow(request)
}

async function getTemplates(collection:string) {
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: collection,    // Account that owns the data
      table: 'templates',        // Table name
      limit: 100,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
      lower_bound: ''
    }

    const templates = await getAllTableRows(request)
    const decoded = []
    for ( const t of templates ) {
        const d = await decodeTemplate(t,collection)
        if ( ! d ) { continue }
        decoded.push( d )
    }
    return decoded;
}

async function getTemplate(collection:string,template_id:string) {
    let request = {
      json: true,               // Get the response as json
      code: 'atomicassets',     // Contract that we target
      scope: collection,    // Account that owns the data
      table: 'templates',        // Table name
      limit: 1,               // Maximum number of rows that we want to get PER REQUEST PAGE
      reverse: false,           // Optional: Get reversed data
      show_payer: false,        // Optional: Show ram payer
      lower_bound: template_id,
      upper_bound: template_id 
    }

    const template = await getOneTableRow(request)
    if ( ! template ) {
        console.log(`WARNING: Unable to find template ${template_id} in collection ${collection}`)
        return
    }
    return await decodeTemplate(template, collection)
}

async function decodeTemplate(template:ITemplate,collection:string) {
    if ( ! collection ) { throw new Error('No template provided') }

    const format = await getSchemaFormat(collection,template.schema_name)
    const immutable_data = decodeData(format, template.immutable_serialized_data ?? new Uint8Array )
    const mutable_data = template.mutable_serialized_data ? decodeData(format, template.mutable_serialized_data ??  new Uint8Array) : {}

    delete template.immutable_serialized_data
    delete template.mutable_serialized_data

    const coll = { collection_name: collection }
    return { ...template, ...immutable_data, ...mutable_data, immutable_data: immutable_data, mutable_data: mutable_data, collection: coll }
}

async function decodeCollection(collection:any) {
    if ( ! collection ) { throw new Error('No collection provided') }

    const format = await getCollectionFormat()
    const data = decodeData(format, collection.serialized_data)
    delete collection.serialized_data

    return { ...collection, ...data, data: data }
}

function decodeData(format:SchemaObject[],raw:Uint8Array) {
    const dataFormat = ObjectSchema(format)
    const data = deserialize( raw, dataFormat )
    return data
}

async function getSchemaFormat(collection:string,schema_name:string) {
    const schema = await getSchema(collection, schema_name)
    return schema.format ?? new Uint8Array
}

async function getCollectionFormat() {
    const c = await getConfig()
    return c.collection_format ?? new Uint8Array
}


export {getConfig,getCollection,getCollectionArray,getCollections,getCollectionFilters,getSchema,getSchemas,getTemplate,getTemplates}