import { errors } from '@strapi/utils';
import { ReadStream } from 'fs';
import { Buffer } from 'buffer';

const { ApplicationError } = errors;

interface File {
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext?: `.${string}`;
  mime: string;
  size: number;
  sizeInBytes: number;
  url: string;
  previewUrl?: string;
  path?: string;
  provider?: string;
  provider_metadata?: Record<string, unknown>;
  stream?: ReadStream;
  buffer?: Buffer;
}

type StorageEndpoints =
  `${'' | 'uk.' | 'ny.' | 'la.' | 'sg.' | 'se.' | 'br.' | 'jh.' | 'syd.'}storage.bunnycdn.com`;

interface InitOptions {
  apiKey: string;
  storageZone: string;
  pullZone: string;
  storageEndpoint?: StorageEndpoints;
}

export default {
  init(
    {
      apiKey,
      storageZone,
      pullZone,
      storageEndpoint = 'storage.bunnycdn.com',
    }: InitOptions = {} as InitOptions
  ) {
    if (!apiKey || !storageZone || !pullZone) {
      throw new ApplicationError("apiKey, storageZone or pullZone can't be null or undefined.");
    }

    if (pullZone.endsWith('/') || storageEndpoint?.endsWith('/')) {
      throw new ApplicationError(
        'pullZone and storageEndpoint should not end with a trailing slash.'
      );
    }

    return {
      async upload(file: File) {
        const data: any = file.stream || Buffer.from(file.buffer as any, 'binary');

        try {
          const response = await fetch(
            `https://${storageEndpoint}/${storageZone}/${file.hash}${file.ext}`,
            {
              body: data,
              method: 'PUT',
              duplex: 'half',
              headers: {
                AccessKey: apiKey,
                'content-type': 'application/octet-stream',
              },
            }
          );

          if (response.status !== 201) {
            throw new ApplicationError(`Error uploading to Bunny.net: ${await response.text()}`);
          }

          file.url = `${/^https?:\/\//.test(pullZone) ? '' : 'https://'}${pullZone}/${file.hash}${file.ext}`;
        } catch (error: any) {
          throw new ApplicationError(`Error uploading to Bunny.net: ${error.message}`);
        }
      },

      uploadStream(file: File) {
        return this.upload(file);
      },

      async delete(file: File) {
        try {
          const response = await fetch(
            `https://${storageEndpoint}/${storageZone}/${file.hash}${file.ext}`,
            {
              method: 'DELETE',
              headers: {
                AccessKey: apiKey,
              },
            }
          );

          if (response.status !== 200) {
            console.error(
              'Soft Error: Failed to delete file; has it already been deleted?',
              await response.text()
            );
          }
        } catch (error: any) {
          console.error(
            'Soft Error: Failed to delete file; has it already been deleted?',
            error.message
          );
        }
      },
    };
  },
};
