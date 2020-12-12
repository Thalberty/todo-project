// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '82e432ohf6'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-jw9s3mm5.us.auth0.com',            // Auth0 domain
  clientId: 'g6kjEvLMcP21FkztyE5zd6En8qJTKDbM',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
