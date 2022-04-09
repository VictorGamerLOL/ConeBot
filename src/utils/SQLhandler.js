const db = require(`./mysqlinit`)
const logger = require(`./logger`)


const SQLhandler = {
    "addCur": async function(guildid,name,symbol,earn,cooldown,rate) {
        try {
            let [cur] = await db.query(`ALTER TABLE ${guildid}users ADD \`${name}\` bigint(255)`)
            let [cur2] = await db.query(`INSERT INTO ${guildid}currencies (name, symbol, earn, cooldown, rate) VALUES ("${name}","${symbol}",${earn},${cooldown},${rate})`)
            let [updt] = await db.query(`UPDATE ${guildid}users SET \`${name}\` = 0`)
            logger.sql(JSON.stringify(cur))
            logger.sql(JSON.stringify(cur2))
            logger.sql(JSON.stringify(updt))
        } catch {
            throw "Error"
        }
    },
    "delCur": async function(guildid,name) {
        let [cur] = await db.query(`ALTER TABLE ${guildid}users DROP \`${name}\``)
        logger.sql(JSON.stringify(cur))
        let [cur2] = await db.query(`DELETE FROM ${guildid}currencies WHERE name='${name}'`)
        logger.sql(JSON.stringify(cur2))
    },
    "guildInit": async function(guildid, guildmembers) {
        members = await guildmembers.fetch({force: true})
        ids = ``
        Array.from(members.values()).forEach(async function(value) {
            if (value.user.bot) return
            ids = ids + `(${value.id}), `
        })
        ids = ids.slice(0, -2)  //remove last comma to stop syntax error
        try{
            let [tbl] = await db.query(`CREATE TABLE ${guildid}currencies (id int NOT NULL AUTO_INCREMENT, name varchar(255), symbol varchar(255), earn bool, cooldown bigint(255), rate bigint(255), PRIMARY KEY (id))`)
            let [tbl2] = await db.query(`CREATE TABLE ${guildid}users (id bigint(255), PRIMARY KEY (id))`)
            let [res] = await db.query(`INSERT INTO ${guildid}users VALUES` + ids)
            logger.sql(JSON.stringify(tbl))
            logger.sql(JSON.stringify(tbl2))
            logger.sql(JSON.stringify(res))
        } catch{
            throw "Error"
        }
        
    },
    "guildDel": async function(guildid) {
        try{
            let [tbl] = await db.query(`DROP TABLE ${guildid}currencies`)
            let [tbl2] = await db.query(`DROP TABLE ${guildid}users`)
            logger.sql(JSON.stringify(tbl))
            logger.sql(JSON.stringify(tbl2))
        } catch{
            throw "Error"
        }
    },
    "selectWhere": async function(what, guildid, whatTable, where, whatValue) {
        if (what == "*") {
            var [res] = await db.query(`SELECT * FROM ${guildid}${whatTable} WHERE ${where} = ${whatValue}`)
        } else {
            var [res] = await db.query(`SELECT \`${what}\` FROM ${guildid}${whatTable} WHERE ${where} = ${whatValue}`)
        }
        logger.sql(JSON.stringify(res))
        return [res]
    },
    "selectAll": async function(what, guildid, whatTable) {
        if (what == "*") {
            var [res] = await db.query(`SELECT * FROM ${guildid}${whatTable}`)
        } else {
            var [res] = await db.query(`SELECT \`${what}\` FROM ${guildid}${whatTable}`)
        }
        logger.sql(JSON.stringify(res))
        return [res]
    },
    "addToMultiple": async function(guildid, what, whatTable, whatValue, where, whereValue) {
        //Comment the code on what it does
        let query1st = `` 
        let query2nd = ``
        let query3rd = ``
        let [tester] = await this.selectAll(`${where}, ${what}`, guildid, whatTable) 
        for (let i = 0; i < whereValue.length; i++) {
            let testIndex=tester.findIndex(x => x.id == whereValue[i]) //Find matching ${where} with the one provided by array to edit the correct user's amount
            if (tester[testIndex] === undefined) continue //CaNnOt ReAd PrOpErTiEs Of UnDeFiNeD omg just shut up here you happy now?
            if (tester[testIndex][what] + whatValue > Number.MAX_SAFE_INTEGER) { //Check if the amount is adding up to more than the max safe integer to stop out of bounds errors
                query2nd += ` ${whereValue[i]}`
                if (i != whereValue.length-1) {
                    query2nd += ` OR ${where} =`
                }
                continue
            }
            //Check if tester[testIndex][what] + whatValue is less than max negative safe integer to prevent out of bounds errors using query3rd
            if (tester[testIndex][what] + whatValue < Number.MIN_SAFE_INTEGER) {
                query3rd += ` ${whereValue[i]}`
                if (i != whereValue.length-1) {
                    query3rd += ` OR ${where} =`
                }
                continue
            }
            query1st += ` ${whereValue[i]}`
            if (i != whereValue.length-1) {
                query1st += ` OR ${where} =`
            }
        }
        //No SQL queries in the loop for better performance (I do not think I need to explain why)
        let query1 = `UPDATE ${guildid}${whatTable} SET [${what}] = [${what}] + ${whatValue} WHERE ${where} =` + query1st
        let query2 = `UPDATE ${guildid}${whatTable} SET [${what}] = ${Number.MAX_SAFE_INTEGER} WHERE ${where} =` + query2nd
        let query3 = `UPDATE ${guildid}${whatTable} SET [${what}] = ${Number.MIN_SAFE_INTEGER} WHERE ${where} =` + query3rd
        if (query1.endsWith(` OR ${where} =`)) {
            query1 = query1.slice(0, -7)
        }
        if (query2.endsWith(` OR ${where} =`)) {
            query2 = query2.slice(0, -7)
        }
        if (query3.endsWith(` OR ${where} =`)) {
            query3 = query3.slice(0, -7)
        }
        if (query1.endsWith(` WHERE ${where} =`)) {  //Check if the queries end properly to stop syntax errors  
            query1 += ` NULL`
        }
        if (query2.endsWith(` WHERE ${where} =`)) {
            query2 += ` NULL`
        }
        if (query3.endsWith(` WHERE ${where} =`)) {
            query3 += ` NULL`
        }
        try {
            let [final1] = await db.query(query1)
            let [final2] = await db.query(query2)
            let [final3] = await db.query(query3)
            logger.sql(JSON.stringify(final1))
            logger.sql(JSON.stringify(final2))
            logger.sql(JSON.stringify(final3))
            return [final1.affectedRows, final2.affectedRows, final3.affectedRows]
        } catch {
            logger.error(`Failed do add to multiple in ${guildid}${whatTable}`)
            throw 'Error'
        }
    },
    "addToSingle": async function(guildid, what, whatTable, whatValue, where, whereValue) {
        let whatQuery=null
        let [tester] = await this.selectWhere(`${where}, ${what}`, guildid, whatTable, where, whereValue)
        if (tester[0] === undefined) return
        if (tester[0][what] + whatValue > Number.MAX_SAFE_INTEGER) {
            whatQuery = Number.MAX_SAFE_INTEGER
        } else if (tester[0][what] + whatValue < Number.MIN_SAFE_INTEGER) {
            whatQuery = Number.MIN_SAFE_INTEGER
        } else {
            whatQuery = tester[0][what] + whatValue
        }
        try{
            let [res] = await db.query(`UPDATE ${guildid}${whatTable} SET ${what} = ${whatQuery} WHERE ${where} = ${whereValue}`)
            logger.sql(JSON.stringify(res))
            return whatQuery
        } catch {
            logger.error(`Failed to add to single in ${guildid}${whatTable}`)
            throw 'Error'
        }
        
    }
}
module.exports = SQLhandler