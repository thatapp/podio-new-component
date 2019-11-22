# podio-component
Podio API component for thatapp.io platform

## Podio Authentication

In order to make OAuth work you need a new App in your Podio. During app creation process you will be asked to specify
the callback URL, to process OAuth authentication via thatapp.io platform your callback URL should be 

```
https://your-tenant.io/callback/oauth2
```

More information you can find [here](https://developers.podio.com/authentication)

## Configure OAuth Client key/secret

In the component repository you need to specify OAuth Client credentials as environment variables. You would need two variables

You would need two variables:
 * ```PODIO_APP_ID``` - your OAuth client key
 * ```PODIO_APP_SECRET``` - your OAUth client secret

