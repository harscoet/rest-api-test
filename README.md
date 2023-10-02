# rest-api-test

## Build docker image and restart deployment to use new docker image

```sh
npm run docker && kubectl rollout restart deployment rest-api-test
```