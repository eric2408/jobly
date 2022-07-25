"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { hasAdminAccess } = require("../middleware/auth");
const Jobs = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNewSchema.json");
const jobUpdateSchema = require("../schemas/jobUpdateSchema.json");
const jobFilterSchema = require("../schemas/jobFilterSchema.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 *
 * Authorization required: login
 */

router.post("/", hasAdminAccess, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Jobs.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET / 
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    const s = req.query;
    if(s.minSalary !== undefined){
      s.minSalary = +s.minSalary;
    } 
    s.hasEquity = s.hasEquity === "true";
    const validator = jsonschema.validate(s, jobFilterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const jobs = await Jobs.findAll(s);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { company }
 *
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Jobs.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] 
 *
 *
 * Authorization required: login
 */

router.patch("/:id", hasAdminAccess, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Jobs.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */

router.delete("/:id", hasAdminAccess, async function (req, res, next) {
  try {
    await Jobs.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;