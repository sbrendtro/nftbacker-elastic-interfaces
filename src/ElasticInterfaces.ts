// We don't currently import assets into ElasticSearch
// export interface IElasticAsset {
//     asset_id: string;
//     name: string;
//     img: string;
//     description: string;
//     data: any[];
//     backed_tokens: any[];
//     is_transferable: boolean;
//     is_burnable: boolean;
//     template_id: string;
//     template_mint: string;
//     schema_name: string;
//     collection_name: string;
//     author: string;
//     contract: string;
//     network: 'wax' | 'eos' | 'proton';
//     created_at_time: string;
//     created_at_block: string;
// }

export interface IElasticCollection {
  collection_name: string;
  name: string;
  img: string;
  description: string;
  images: string;
  socials: string;
  creator_info: string;
  allow_notify: boolean;
  authorized_accounts: string[];
  notify_accounts: string[];
  market_fee: string;
  data: any;
  author: string;
  contract: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time: string;
  created_at_block: string;
}

export class ElasticCollection implements IElasticCollection {
  constructor(o: any, network: 'wax' | 'eos' | 'proton') {
    this.collection_name = o.collection_name;
    this.name = o.name;
    this.img = o.img;
    this.description = o.data.description;
    this.images = o.images;
    this.socials = o.socials;
    this.creator_info = o.creator_info;
    this.allow_notify = o.allow_notify;
    this.authorized_accounts = o.authorized_accounts;
    this.notify_accounts = o.notify_accounts;
    this.market_fee = o.market_fee;
    this.author = o.author;
    this.contract = o.contract;
    this.network = network;
    this.created_at_time = o.created_at_time;
    this.created_at_block = o.created_at_block;

    // data to decode
    const decodeFields = ['images', 'socials', 'creator_info'];
    for (const field of decodeFields) {
      if (typeof o.data[field] === 'string' || o.data[field] instanceof String) {
        o.data[field] = JSON.parse(o.data[field]);
      }
    }
    // Set the data
    this.data = o.data;
  }
  uniqueId(): string {
    return [this.network, 'collection', this.collection_name].join('-');
  }
  collection_name: string;
  name: string;
  img: string;
  description: string;
  images: string;
  socials: string;
  creator_info: string;
  allow_notify: boolean;
  authorized_accounts: string[];
  notify_accounts: string[];
  market_fee: string;
  data: any;
  author: string;
  contract: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time: string;
  created_at_block: string;
}

export interface IElasticTemplate {
  template_id: string;
  collection_name: string;
  schema_name: string;
  name: string;
  img: string;
  description: string;
  immutable_data: any;
  is_transferable: boolean;
  is_burnable: boolean;
  issued_supply: string;
  max_supply: string;
  contract?: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time?: string;
  created_at_block?: string;
}

export class ElasticTemplate implements IElasticTemplate {
  constructor(o: any, network: 'wax' | 'eos' | 'proton') {
    this.template_id = o.template_id;
    this.collection_name = o.collection.collection_name;
    this.schema_name = o.schema_name;
    this.name = o.name;
    this.img = o.img;
    this.description = this.decodeDescription(o);
    this.immutable_data = o.immutable_data;
    this.is_transferable = o.transferable;
    this.is_burnable = o.burnable;
    this.issued_supply = o.issued_supply;
    this.max_supply = o.max_supply;
    this.contract = o.contract;
    this.network = network;
    this.created_at_time = o.created_at_time;
    this.created_at_block = o.created_at_block;
  }
  uniqueId(): string {
    return [this.network, 'template', this.template_id].join('-');
  }
  decodeDescription(o: any): string {
    if (o.schema && o.schema.format && o.data) {
      // Try to find a field with one of the field names
      for (const f of o.schema.format) {
        if (f.type == 'string' && ['description', 'desc'].includes(f.name)) {
          return o.data[f.name] ?? '';
          break;
        }
      }
      // Otherwise default to the collection name
      if (o.collection.name) {
        return o.collection.name;
      }
    }
    return '';
  }
  template_id: string;
  collection_name: string;
  schema_name: string;
  name: string;
  img: string;
  description: string;
  immutable_data: any;
  is_transferable: boolean;
  is_burnable: boolean;
  issued_supply: string;
  max_supply: string;
  contract?: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time?: string;
  created_at_block?: string;
}

export interface IElasticSchema {
  schema_name: string;
  collection_name: string;
  // description: string;
  format: any[];
  contract?: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time?: string;
  created_at_block?: string;
}

export class ElasticSchema implements IElasticSchema {
  constructor(o: any, network: 'wax' | 'eos' | 'proton') {
    this.collection_name = o.collection.collection_name;
    this.schema_name = o.schema_name;
    // this.description = o.collection.name;
    this.format = o.format;
    this.contract = o.contract;
    this.network = network;
    this.created_at_time = o.created_at_time;
    this.created_at_block = o.created_at_block;
  }
  uniqueId(): string {
    return [this.network, 'schema', this.collection_name, this.schema_name].join('-');
  }
  schema_name: string;
  collection_name: string;
  // description: string;
  format: any[];
  author?: string;
  contract?: string;
  network: 'wax' | 'eos' | 'proton';
  created_at_time?: string;
  created_at_block?: string;
}
