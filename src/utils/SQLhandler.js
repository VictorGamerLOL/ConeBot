const db = require(`./mysqlinit`)

const SQLhandler = {
    "addCur": async function(guildid,name,symbol,earn,cooldown,rate) {
        let [cur] = await db.query(`INSERT INTO ${guildid}currencies VALUES (?,?,?,?,?)`, [name, symbol, earn, cooldown, rate])
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
    "guildInit": async function(guild) {
        let [tbl] = await db.query(`CREATE TABLE ${guild.id}currencies (name varchar(255), symbol varchar(255), earn bool, cooldown bigint(255), rate bigint(255), PRIMARY KEY (name))`)
        console.log(tbl)
        let [tbl2] = await db.query(`CREATE TABLE ${guild.id}users (id bigint(255), PRIMARY KEY (id))`)
        console.log(tbl2)
    }
}
module.exports = SQLhandler