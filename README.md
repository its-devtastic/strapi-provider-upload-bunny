# strapi-provider-upload-bunny

🐰 Bunny.net upload provider for Strapi v5.

- Written in TypeScript
- No dependencies. Using native fetch.

## Installation
```shell
npm i --save strapi-provider-upload-bunny
```

## Configuration

### Example

`./config/plugins.ts`

```ts
export default ({ env }) => ({
  //...
  upload: {
    config: {
      provider: "strapi-provider-upload-bunny",
      providerOptions: {
        apiKey: env("BUNNY_API_KEY"),
        storageZone: env("BUNNY_STORAGE_ZONE"),
        pullZone: env("BUNNY_PULL_ZONE"),

        // optional:
        // storageEndpoint: env("BUNNY_STORAGE_ENDPOINT"),
      },
    },
  },
  //...
})
```

### Options
```
apiKey: Storage password (Inside FTP & API Access).
storageZone: Storage zone name.
pullZone: Pull zone URL.
storageEndpoint: Storage endpoint url (optional)
```
Enter `pullZone` and `storageEndpoint` without `https://` and without a trailing `/`.

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.ts`

```ts
export default ({ env }) => [
  // ...
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": ["'self'", "data:", "blob:", env("BUNNY_PULL_ZONE")],
          "media-src": ["'self'", "data:", "blob:", env("BUNNY_PULL_ZONE")],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
]
```
