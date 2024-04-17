# BSEPP
> [!IMPORTANT]  
> The project is **not** affiliated with Stanford University or the Stanford Encyclopedia of Philosophy.
> It is a personal project to create a better version of the Stanford Encyclopedia of Philosophy.
>
> You may not use this project for commercial nor public use without permission from the original authors and Stanford University.

The **Better Stanford Encyclopedia of Philosophy Project** aimed to create a better version of the Stanford Encyclopedia of Philosophy, with a more modern design and better search capabilities.

By using, downloading, or contributing to this project, you agree to [Stanford University's terms of use](https://plato.stanford.edu/info.html). You may not publicly use this project without permission from the original authors and Stanford University.

Consider [Friends of the SEP Society](https://leibniz.stanford.edu/friends/).

## Important Information
Please take the following into consideration:
- This is unsustainable due to how the SEP website is structured
- Using the name "Stanford" requires affiliation or permission from Stanford University
- You may not distribute the content of SEP articles without permission
- Changes are not guaranteed to be up-to-date with the SEP, as some are undocumented changes
- The publication of a website of this project would undermine SEP's support, impact, metrics, and understanding and should be avoided
- An unofficial API would violate SEP's exclusive license.
- Scraping must not place a burden on the SEP servers

# Developer notes

## Structure
```
./
  config/                // Configuration files
    db.js                // Mongoose singleton
    redisCfg.js          // Redis client and store for sessions
  controllers/           // Controller to handle data
    ...
  data/                  // Data (roles, etc.)
    ...
  middlewares/           // Middleware (i.e. auth)
    ...
  model/                 // Mongoose model schemas
    ...
  routes/                // All routes
    v1/                  // API version
      exampleRoute.js    // Route in version
    v1Route.js           // Route linking all in v1/
  services/              // Services to access model (i.e. roles)
    ...
  pipelines/             // Database aggregation pipelines
    ...
  app.js                 // Main server entry point
  scrapeEntries.js       // Initial scraper script
  scrapeRss.js           // Lambda function scraper
```

A controller would be initialised in `controllers/` (likely referencing utility functions in `services/`). A route is created in `./routes/v1/theRoute.js`, and registered in `./routes/v1/v1Route.js`. The `v1Route.js` is used in `./app.js`.

`scrapeEntries.js` is a temporary file to set up the initial database. `scrapeRss.js` is a lambda function to be called in intervals to keep the database up-to-date.

## Environment Variables
The `.env` file must contain the keys:
```
MONGO_URL=mongodb+srv://<user>:<pw>@<cluster>/<db>
SESSION_SECRET=<redis-secret>
ENV=<development || production>
SESSION_EXPIRY=604800
REDIS_HOST=<redis-host>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-password>
```
Mongo URI must have read & write permission

## System
Details the system design we use

### Redis
Session-based authentication with `express-session`, `redis`, `connect-redis`.  
User ID is stored in `req.session.user`, use it to query the database to get further information.  

This is typically used through `services` modules.

### Mongo
MongoDB database to store:
1. User information
2. Articles (entries)
3. Article contents

Follow schema in `./models`.

#### Indexes
Entry collection must have the search index:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": [
        {
          "type": "autocomplete",
          "tokenOrder": "sequential",
          "maxGrams": 7,
          "minGrams": 3
        },
        {
          "type": "string",
          "analyzer": "lucene.standard"
        }
      ],
      "preamble": [
        {
          "type": "string",
          "analyzer": "lucene.standard"
        }
      ]
    }
  }
}
```

### AWS
Lambda function `scrapeRss.js` will be stored in an AWS Lambda function. It will be called in intervals (AWS CloudWatch) at a specific time every day (or another suitable interval).

Currently not implemented.

## Roles
Stored in `./data/roles.json`. Does not support inheritance, nor is it ordered.
- **user** (default)
- **elevated**: users who can view entry contents (private)
