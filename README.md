Doclab
=============

![Build Status](https://travis-ci.org/luin/doclab.svg?branch=master)
[![Code Climate](https://codeclimate.com/github/luin/doclab/badges/gpa.svg)](https://codeclimate.com/github/luin/doclab)
[![Test Coverage](https://codeclimate.com/github/luin/doclab/badges/coverage.svg)](https://codeclimate.com/github/luin/doclab)
[![Dependency Status](https://david-dm.org/luin/doclab.svg)](https://david-dm.org/luin/doclab)

Install
-------

    npm install doclab-api

HTTP API
-------

There are two methods available for authentication: HTTP Basic and session token. HTTP Basic authentication should only be used to request a new session token or when session token don't have enough permission to access(or update) the resource(i.e. changing user's password).

To auth a user using session token, set the custom header "X-SESSION-TOKEN" with the value of the token you have.

### Sessions

**POST** `/sessions`

Create a new session and get the token. You need to specify a ttl(measured in seconds).

[Test](test/api/sessions/create_session.js)
[Code](routes/sessions.js)

### Users

**GET** `/users/{userId|'me'}`

Get the info of the user

[Test](test/api/users/get_user.js)
[Code](routes/users.js)

**POST** `/users`

Create a new user

[Test](test/api/users/create_user.js)
[Code](routes/users.js)

**PATCH** `/users/{userId|'me'}`

Update the current user's info

[Test](test/api/users/patch_user.js)
[Code](routes/users.js)

**PUT** `/users/{userId|'me'}/password`

Update the current user's password

[Test](test/api/users/update_password.js)
[Code](routes/users.js)

### Teams

**GET** `/teams`

Get all teams

[Test](test/api/teams/get_teams.js)
[Code](routes/teams.js)

**POST** `/teams`

Create a new team

[Test](test/api/teams/create_team.js)
[Code](routes/teams.js)

### Projects

**POST** `/projects`

Create a new project

[Test](test/api/projects/create_project.js)
[Code](routes/projects.js)

**GET** `/projects`

Get all projects which the current user has access to

[Test](test/api/projects/get_projects.js)
[Code](routes/projects.js)

**GET** `/projects/:projectId`

Get the specified project info

[Test](test/api/projects/get_project.js)
[Code](routes/projects.js)

**PATCH** `/projects/:projectId`

Update a project

[Test](test/api/projects/update_project.js)
[Code](routes/projects.js)

**POST** `/projects/:projectId/collections`

Create a collection

[Test](test/api/projects/create_collection.js)
[Code](routes/projects.js)

**PUT** `/projects/:projectId/teams/:teamId`

Update the permission of the team to the project

[Test](test/api/projects/update_team_permission.js)
[Code](routes/projects.js)

### Collections

**Get** `/collections/:collectionId`

Get the specified collection info

[Test](test/api/collections/get_collection.js)
[Code](routes/collections.js)

**Get** `/collections/:collectionId/dirs`

Get the dirs of a collection

[Test](test/api/collections/get_collection_dirs.js)
[Code](routes/collections.js)

**POST** `/collections/:collectionId/dirs/_move`

Move the doc in the dirs

[Test](test/api/collections/move_collection_dirs.js)
[Code](routes/collections.js)

**POST** `/collections/:collectionId/docs`

Create a doc

[Test](test/api/collections/create_doc.js)
[Code](routes/collections.js)

**POST** `/collections/:collectionId/_move`

Move a collection

[Test](test/api/collections/move_collection.js)
[Code](routes/collections.js)

### Docs

**GET** `/docs/:docUUID`

Get the doc.You can use `?version=:version` to specified a version

[Test](test/api/docs/get_doc.js)
[Code](routes/docs.js)

GET `/docs/:docUUID/versions`

Get the versions of the doc

[Test](test/api/docs/get_doc_versions.js)
[Code](routes/docs.js)

**PATCH** `/docs/:docUUID`

Update the title or content of the doc

[Test](test/api/docs/update_doc.js)
[Code](routes/docs.js)
