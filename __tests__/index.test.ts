import { IElasticCollection, IElasticTemplate, IElasticSchema, ElasticCollection, ElasticTemplate, ElasticSchema } from "../src/index"

import {serialize, deserialize, ObjectSchema} from "atomicassets"
import { JsonRpc } from "eosjs"

import { getCollection, getSchema, getTemplate } from "../src/atomic"

const collection_name = 'earlyibmfans'
const template_id = '209164'
const schema_name = 'poster'

test('can use collection interface and class', async () => {
    const data = await getCollection(collection_name)
    const o = new ElasticCollection(data,'wax')
    const images = JSON.parse(o.images)
    const socials = JSON.parse(o.socials)
    const creator_info = JSON.parse(o.creator_info)

    expect(o.collection_name).toBe(collection_name)
    expect(o.name).toBe('IBM PC NFT Experience')
    expect(o.img).toBe('QmaTT6bZeUhxVE1f9JRnD5yDxqeCQjaDFZ9aqrnE93Bjap')
    expect(o.description).toMatch('August 12')
    expect(images).toHaveProperty('banner_1920x500')
    expect(images).toHaveProperty('logo_512x512')
    expect(socials).toHaveProperty('twitter')
    expect(socials).toHaveProperty('facebook')
    expect(socials).toHaveProperty('discord')
    expect(creator_info).toHaveProperty('address')
    expect(creator_info).toHaveProperty('company')
    expect(creator_info).toHaveProperty('name')
    expect(creator_info).toHaveProperty('registration_number')
    expect(o.allow_notify).toBeTruthy()
    expect(Array.isArray(o.authorized_accounts)).toBeTruthy()
    expect(Array.isArray(o.notify_accounts)).toBeTruthy()
    expect(o.market_fee).toBe("0.05000000000000000")
    expect(o.data).toHaveProperty('name')
    expect(o.data).toHaveProperty('img')
    expect(o.data).toHaveProperty('description')
    expect(o.data).toHaveProperty('url')
    expect(o.data).toHaveProperty('images')
    expect(o.data).toHaveProperty('socials')
    expect(o.data).toHaveProperty('creator_info')
    expect(o.author).toBe('earlyibmfans')
    expect(o.network).toBe('wax')

    // The following are null for now, they exist if pulled from AtomicAssets REST APIs
    // expect(o.contract).toBe()
    // expect(o.created_at_time).toBe()
    // expect(o.created_at_block).toBe()
  });

  test('can use template interface and class', async () => {
    const data = await getTemplate(collection_name,template_id)
    const o = new ElasticTemplate(data,'wax')
  
    expect(o.template_id).toBe(parseInt(template_id))
    expect(o.collection_name).toBe(collection_name)
    expect(o.schema_name).toBe('poster')
    expect(o.name).toBe('1981 called. It wants the PC back.')
    expect(o.img).toBe('QmVSaVBbTCnoFh55ZGVFNDkF2mnhUoo83TLHQNTnjJS2e8')
    expect(o.description).toBe('')
    expect(o.immutable_data).toHaveProperty('name')
    expect(o.immutable_data).toHaveProperty('img')
    expect(o.immutable_data).toHaveProperty('website')
    expect(o.immutable_data.name).toBe('1981 called. It wants the PC back.')
    expect(o.immutable_data.img).toBe('QmVSaVBbTCnoFh55ZGVFNDkF2mnhUoo83TLHQNTnjJS2e8')
    expect(o.immutable_data.website).toBe('https://ibmpc.io')
    expect(o.is_transferable).toBeTruthy()
    expect(o.is_burnable).toBeTruthy()

    expect(o.issued_supply).toBe(500)
    expect(o.max_supply).toBe(500)
    expect(o.network).toBe('wax')

    // The following are null for now, they exist if pulled from AtomicAssets REST APIs
    // expect(o.author).toBe()
    // expect(o.contract).toBe()
    // expect(o.created_at_time).toBe()
    // expect(o.created_at_block).toBe()
  });

  test('can use schema interface and class', async () => {
    const data = await getSchema(collection_name,schema_name)
    // Add the collection information
    data.collection = await getCollection(collection_name)
    const o = new ElasticSchema(data,'wax')

    const format = [
        { name: 'name', type: 'string' },
        { name: 'img', type: 'image' },
        { name: 'website', type: 'string' },
        { name: 'altimg', type: 'image' },
        { name: 'series', type: 'string' },
        { name: 'legal', type: 'string' }
    ]
  
    expect(o.collection_name).toBe(collection_name)
    expect(o.schema_name).toBe(schema_name)
    expect(o.format).toEqual(format)
    expect(o.network).toBe('wax')

    // The following are null for now, they exist if pulled from AtomicAssets REST APIs
    // expect(o.contract).toBe()
    // expect(o.created_at_time).toBe()
    // expect(o.created_at_block).toBe()
  });