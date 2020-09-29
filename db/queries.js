import { CORRECT_QUERY, ERROR_DB, ERROR_QUERY } from '../constants/constants';
import { getErrorCodeFromString } from '../utils';

const config = require('../config/config');

const oracledb = require('oracledb');
oracledb.autoCommit = true;

export async function initDatabaseConnection() {

    try {
        await oracledb.createPool({
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            connectString: config.DB_HOST
        });
        
    } catch (error) {        
        console.log(ERROR_DB);
    }

}

export async function getAllRows() {

    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute("SELECT * FROM spiegazioni")
        connection.close();
        console.log(result)
    } catch (error) {
        console.log(error);
        return ERROR_DB;
    }
    
}

export async function insertNewRow(query, error, spiegazione) {

    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute("INSERT INTO spiegazioni (query, errore, spiegazione) VALUES (:query, :error, :spiegazione)",[query, error, spiegazione])
        connection.commit();
        connection.close();
        return result.rows;
    } catch (error) {
        return ERROR_DB;
    }
    
}

export async function getRowByError(error) {

    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute("SELECT * FROM spiegazioni WHERE errore = :errore",[error])
        connection.close();
        return result.rows;
    } catch (error) {
        return ERROR_DB;
    }
    
}

export async function checkQuery(query) {

    try {
        const connection = await oracledb.getConnection();
        try {
            await connection.execute("EXPLAIN PLAN FOR " + query);
            return CORRECT_QUERY;
        } catch (error) {
            console.log(error);
            const code = getErrorCodeFromString(error.message);
            const result = await connection.execute("SELECT * FROM spiegazioni WHERE errore = :errore",[code])
            connection.close();
            return result.rows;
        }
    } catch (error) {
        return ERROR_DB;
    }
    
}

export async function getDatabaseVersion(error) {

    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute("SELECT banner FROM v$version WHERE banner LIKE 'Oracle%'")
        connection.close();
        return result.rows;
    } catch (error) {
        return ERROR_DB;
    }
    
}