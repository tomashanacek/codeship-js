const axios = require('axios')
const CODESHIP_URL = 'https://api.codeship.com/v2'
const AUTH_URL = `${CODESHIP_URL}/auth`

class Organization {
    constructor(accessToken, data) {
        this.uuid = data.uuid
        this.name = data.name
        this.accessToken = accessToken
    }

    async listBuilds(projectUuid) {
        const url = `${CODESHIP_URL}/organizations/${this.uuid}/projects/${projectUuid}/builds`

        const res = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            params: {
                per_page: 50
            }
        })

        return res.data.builds
    }

    async createBuild(projectUuid, ref, commitSha) {
        const url = `${CODESHIP_URL}/organizations/${this.uuid}/projects/${projectUuid}/builds`

        return await axios.post(url, {
            ref,
            commit_sha: commitSha
        }, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        })
    }

    async restartBuild(projectUuid, buildUuid) {
        const url = `${CODESHIP_URL}/organizations/${this.uuid}/projects/${projectUuid}/builds/${buildUuid}/restart`

        return await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        })
    }
}

class Codeship {

    constructor(username, password) {
        this.username = username
        this.password = password
    }

    async auth() {
        const res = await axios.post(AUTH_URL, {}, {
            auth: {
                username: this.username,
                password: this.password
            }
        })

        this.accessToken = res.data.access_token
        this.organizations = res.data.organizations
    }

    organization(name) {
        const organization = this.organizations.filter((organization) => {
            return organization.name === name
        })[0]
        if (organization) {
            return new Organization(this.accessToken, organization)
        } else {
            throw new Error(`There is no ${name} organization`)
        }
    }

}

module.exports = Codeship