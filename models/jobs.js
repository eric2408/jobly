"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Jobs {
  /** Create a job (from data), update db, return new job data.
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [
            title,
            salary,
            equity,
            companyHandle
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all jobs.
   *
   * */

  static async findAll(searchQuery = {}) {
    let sql = `SELECT j.id,
                  j.title,
                  j.salary,
                  j.equity,
                  j.company_handle AS "companyHandle",
                  c.name 
              FROM jobs j
                LEFT JOIN companies As c ON c.handle = j.company_handle`;

    let valueSec = [];
    let whereSec = [];

    const { title, minSalary, hasEquity } = searchQuery;

    if(title !== undefined){
      valueSec.push(`%${title}%`);
      whereSec.push(`title LIKE $${valueSec.length}`);
    }

    if(minSalary !== undefined){
      valueSec.push(minSalary);
      whereSec.push(`salary >= $${valueSec.length}`);
    }

    if(hasEquity === true){
      valueSec.push(0);
      whereSec.push(`equity > $${valueSec.length}`);
    }

    if(whereSec.length > 0){
      sql += " WHERE " + whereSec.join(" AND ");
    }

    sql += " ORDER BY title";
    const result = await db.query(sql, valueSec);
    return result.rows;

  }

  /** Given a job title, return data about the job.
   *
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const result = await db.query(
          `SELECT id,
           title,
           salary,
           equity,
           company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
        [id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companyRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);

    delete job.companyHandle;       
    job.company = companyRes.rows[0];

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          company_handle: "companyHandle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Jobs;
