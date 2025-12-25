import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { payloadAiPlugin, PayloadAiPluginLexicalEditorFeature } from '@/index'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const MEDIA_SLUG = 'media'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Ecommerce Template` : 'Payload Ecommerce Template'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const s3MediaStoragePlugin: Plugin = (incomingConfig) => {
  // Evaluate at Payload init-time to avoid baking env-dependent behavior into builds.
  const s3Enabled = process.env.SYNESTRA_MEDIA_STORAGE === 's3'

  if (s3Enabled) {
    const required = [
      'S3_ENDPOINT',
      'S3_BUCKET',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'S3_REGION',
    ] as const

    const missing = required.filter((key) => !process.env[key])
    if (missing.length > 0) {
      throw new Error(
        `SYNESTRA_MEDIA_STORAGE=s3, but missing required env vars: ${missing.join(', ')}`,
      )
    }
  }

  return s3Storage({
    enabled: s3Enabled,
    collections: {
      [MEDIA_SLUG]: true,
    },
    bucket: process.env.S3_BUCKET || 'payload-media',
    config: s3Enabled
      ? {
          region: process.env.S3_REGION || 'us-east-1',
          endpoint: process.env.S3_ENDPOINT!,
          forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        }
      : {},
  })(incomingConfig)
}

export const plugins: Plugin[] = [
  s3MediaStoragePlugin,
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: {
        group: 'Content',
      },
    },
    formOverrides: {
      admin: {
        group: 'Content',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    PayloadAiPluginLexicalEditorFeature(),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  payloadAiPlugin({
    access: {
      generate: ({ req }) => Array.isArray(req.user?.roles) && req.user.roles.includes('admin'),
      settings: ({ req }) => Array.isArray(req.user?.roles) && req.user.roles.includes('admin'),
    },
    collections: {
      pages: true,
      products: true,
    },
    debugging: process.env.SYNESTRA_ENV === 'dev',
    disableSponsorMessage: false,
    generatePromptOnInit: process.env.SYNESTRA_ENV === 'dev',
    uploadCollectionSlug: 'media',
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    payments: {
      paymentMethods: [],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
