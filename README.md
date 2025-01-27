# shopify-app-session-storage-postgresql_modified
Modified version of Shopify's SQL session storage to allow SSL certification.

To pass a valid CA certificate in your SSL options, first:

- check for the current certificate and download it: https://learn.microsoft.com/en-us/previous-versions/azure/postgresql/single-server/concepts-ssl-connection-security#public-certificate
- convert it to ".pem" with openssl if it is ".crt" or other format: `openssl x509 -inform DER -in certificate.crt -out certificate.crt.pem -outform PEM`
- check the connection with "sslrootcert" on pgAdmin or your respective DB connector, setting the .pem path
- if the connection is working, extract the base64 string: `export DB_CA_CERT=$(cat certificate.crt.pem | base64)` or using `$certBytes = Get-Content -Path .\certificate.crt.pem -Encoding Byte >> [Convert]::ToBase64String($certBytes) | Out-File .\certificate.crt.pem.b64`
- log it: `echo $DB_CA_CERT`
- add the value to your .env variable PG_SSLROOTCERT

You can then pass the CA certificate in the SSL options like this:

```js
import {shopifyApp} from '@shopify/shopify-app-express';
import {PostgreSQLSessionStorage} from './shopify-app-session-storage-postgresql_modified';

const caCert = Buffer.from(process.env.PG_SSLROOTCERT, 'base64').toString('utf-8');

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    'postgres://username:password@host/database',
  ),
    {
        rejectUnauthorized: process.env.PG_SSL === 'true', // toggle rejectUnauthorized based on .env PG_SSL
        ca: caCert,
    },
    {}
});

// OR

const shopify = shopifyApp({
  sessionStorage: new PostgreSQLSessionStorage(
    new URL('postgres://username:password@host/database'),
  ),
      {
        rejectUnauthorized: process.env.PG_SSL === 'true',
        ca: caCert,
    },
    {}
});

// OR

const shopify = shopifyApp({
  sessionStorage: PostgreSQLSessionStorage.withCredentials(
    'host.com',
    'thedatabase',
    'username',
    'password',
  ),
      {
        rejectUnauthorized: process.env.PG_SSL === 'true',
        ca: caCert,
    },
    {} // further opts
});
```