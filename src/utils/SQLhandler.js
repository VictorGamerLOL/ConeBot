const db = require(`./mysqlinit`)
const logger = require(`./logger`)

const SQLhandler = {
    "addCur": async function(guildid,name,symbol,earn,cooldown,rate) {
        let [cur] = await db.query(`INSERT INTO ${guildid}currencies (name, symbol, earn, cooldown, rate) VALUES (?,?,?,?,?)`, [name, symbol, earn, cooldown, rate])
        logger.sql(JSON.stringify(cur))
        let [cur2] = await db.query(`ALTER TABLE ${guildid}users ADD ${name} bigint(255)`)
        logger.sql(JSON.stringify(cur2))
        let [updt] = await db.query(`UPDATE ${guildid}users SET ${name} = 0`)
        logger.sql(JSON.stringify(updt))
    },
    "delCur": async function(guildid,name) {
        let [cur] = await db.query(`ALTER TABLE ${guildid}users DROP ${name}`)
        logger.sql(JSON.stringify(cur))
        let [cur2] = await db.query(`DELETE FROM ${guildid}currencies WHERE name='${name}'`)
        logger.sql(JSON.stringify(cur2))
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
    },
    "selectWhere": async function(what, guildid, whatTable, where, whatValue) {
        let [res] = await db.query(`SELECT ${what} FROM ${guildid}${whatTable} WHERE ${where} = ${whatValue}`)
        logger.sql(JSON.stringify(res))
        return [res]
    },
    "selectAll": async function(what, guildid, whatTable) {
        let [res] = await db.query(`SELECT ${what} FROM ${guildid}${whatTable}`)
        logger.sql(JSON.stringify(res))
        return [res]
    },
    "updateMultiple": async function(guildid, what, whatTable, whatValue, where, whereValue) {
        let query = `UPDATE ${guildid}${whatTable} SET ${what} = ${whatValue} WHERE ${where} =`
        for (let i = 0; i < whereValue.length; i++) {
            query += ` ${whereValue[i]}`
            if (i != whereValue.length-1) {
                query += ` OR ${where} =`
            }
        }
        let [testt] = await db.query(query)
        logger.sql(JSON.stringify(testt))
    }
}
module.exports = SQLhandler