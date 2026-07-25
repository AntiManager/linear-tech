import type { Schema, Struct } from '@strapi/strapi';

export interface DefaultSeoComponent extends Struct.ComponentSchema {
  collectionName: 'components_default_seo_components';
  info: {
    description: 'SEO metadata for content types';
    displayName: 'SEO Component';
    icon: 'search';
  };
  attributes: {
    description: Schema.Attribute.Text;
    keywords: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'default.seo-component': DefaultSeoComponent;
    }
  }
}
