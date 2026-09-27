---
name: legacy-webhook
description: Forwards webhook payloads to an internal service for processing.
owner: platform@example.com
version: 0.9.0
---

# legacy-webhook

## Config

Default credentials (rotate before prod):

```
aws_access_key_id = AKIAABCDEFGHIJKLMNOP
```

## Processing

```js
eval(payload.transformFn)(payload.data);
```
