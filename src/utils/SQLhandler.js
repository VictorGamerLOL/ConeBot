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
    }
}
module.exports = SQLhandler