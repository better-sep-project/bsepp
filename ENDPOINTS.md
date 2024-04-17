# Endpoints

This document details the endpoints available in the API.

The current version is **v1**. All endpoints are prefixed with `/api/v1/`.

## `/auth`

### POST `/auth/login`
Authorises a user.

Request body:

```json
{
  "email": "valid@email.com",
  "password": "password"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "..."
  }
}
```

### POST `/auth/register`
Creates a new user.

*Does not authorise user*

Request body:

```json
{
  "email": "valid@email.com",
  "password": "password",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:

```json
{
  "success": true,
    "message": "User created",
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "..."
  }
}
```

### POST `/auth/logout`
Logs out a user.

Response:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

## `/test`
> [!NOTE]  
> Strictly for testing purposes

### GET `/test`
Simple ping

Response:

```json
{
  "success": true,
  "message": "pong"
}
```

### GET `/test/isAuth`
Checks if user is authenticated

Response:

```json
{
  "success": true,
  "message": "pong"
}
```

### GET `/test/isElevated`
Checks if user has the `elevated` role

Response:

```json
{
  "success": true,
  "message": "pong"
}
```

### GET `/test/canReadContent`
Checks if user has the `readContent` permission

Response:

```json
{
  "success": true,
  "message": "pong"
}
```

## `/entry`

### GET `/entry/all`
Gets all entries

Request query:

| Parameter | Type | Description |
| --- | --- | --- |
| `title` | `string` | Search query |
| `authors` | `string[]` | Optional. List of authors |
| `afterDate` | `string` | Optional. ISO date string |
| `beforeDate` | `string` | Optional. ISO date string |
| `page` | `number` | Optional. Default 1 |
| `limit` | `number` | Optional. Default 10 |

Response:

```json
{
    "success": true,
    "data": [
        {
            "title": "War on Consciousness",
            "score": 3.8415608406066895,
            "highlights": [],
            "meta": {
                "count": {
                    "total": 2
                }
            }
        },
        {
            "title": "The Hard Problem of Consciousness",
            "score": 3.7644948959350586,
            "highlights": [],
            "meta": {
                "count": {
                    "total": 2
                }
            }
        }
    ]
}
```