const db = require(`./mysqlinit`)
const logger = require(`./logger`)

const SQLhandler = {
    "addCur": async function(guildid,name,symbol,earn,cooldown,rate) {
        let [cur] = await db.query(`INSERT INTO ${guildid}currencies (name, symbol, earn, cooldown, rate) VALUES (?,?,?,?,?)`, [name, symbol, earn, cooldown, rate])
        console.log(cur)
        let [cur2] = await db.query(`ALTER TABLE ${guildid}users ADD ${name} bigint(255)`)
        console.log(cur2)
    },
    "delCur": async function(guildid,name) {
        let [cur] = await db.query(`ALTER TABLE ${guildid}users DROP ${name}`)
        console.log(cur)
        let [cur2] = await db.query(`DELETE FROM ${guildid}currencies WHERE name='${name}'`)
        console.log(cur2)
    },
    "guildInit": async function(guildid, guildmembers) {
        let [tbl] = await db.query(`CREATE TABLE ${guildid}currencies (id int NOT NULL AUTO_INCREMENT, name varchar(255), symbol varchar(255), earn bool, cooldown bigint(255), rate bigint(255), PRIMARY KEY (id))`)
        logger.sql(JSON.stringify(tbl))
        let [tbl2] = await db.query(`CREATE TABLE ${guildid}users (id bigint(255), PRIMARY KEY (id))`)
        logger.sql(JSON.stringify(tbl2))
        members = await guildmembers.fetch({force: true})
        Array.from(members.values()).forEach(async function(value) {
            if (value.user.bot) return
            let [res] = await db.query(`INSERT INTO ${guildid}users VALUES (${value.user.id})`)
            logger.sql(JSON.stringify(res))
        })
    }
}
module.exports = SQLhandler