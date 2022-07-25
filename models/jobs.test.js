"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Jobs = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "job5", 
    salary: 80000, 
    equity: "0.5", 
    companyHandle: "c1"
  };

  test("works", async function () {
    let job = await Jobs.create(newJob);
    expect(job).toEqual({
        ...newJob,
        id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Jobs.findAll();
    expect(jobs).toEqual([
        {
            id: testJobIds[0],
            title: "job1",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
            name: "C1",
          },
          {
            id: testJobIds[1],
            title: "job2",
            salary: 90000,
            equity: "0.2",
            companyHandle: "c1",
            name: "C1",
          },
          {
            id: testJobIds[2],
            title: "job3",
            salary: 60000,
            equity: "0",
            companyHandle: "c1",
            name: "C1",
          },
          {
            id: testJobIds[3],
            title: "job4",
            salary: null,
            equity: null,
            companyHandle: "c1",
            name: "C1",
          },
    ]);
  });

  test("works: filter by title", async function(){
    const jobs = await Jobs.findAll({ title: "3" });
    expect(jobs).toEqual([
        {
            id: testJobIds[2],
            title: "job3",
            salary: 60000,
            equity: "0",
            companyHandle: "c1",
            name: "C1",
          },
    ]);
  });

  test("works: filter by minSalary", async function(){
    const jobs = await Jobs.findAll({ minSalary: 95000 });
    expect(jobs).toEqual([
        {
            id: testJobIds[0],
            title: "job1",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
            name: "C1",
          },
    ]);
  });

  test("works: filter by having equity", async function(){
    const jobs = await Jobs.findAll({ hasEquity: true });
    expect(jobs).toEqual([
        {
            id: testJobIds[0],
            title: "job1",
            salary: 100000,
            equity: "0.1",
            companyHandle: "c1",
            name: "C1",
          },
          {
            id: testJobIds[1],
            title: "job2",
            salary: 90000,
            equity: "0.2",
            companyHandle: "c1",
            name: "C1",
          },
    ]);
  });
});



/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Jobs.get(testJobIds[0]);
    expect(job).toEqual({
        id: testJobIds[0],
        title: "job1",
        salary: 100000,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
    });
  });

  test("not found if no such job", async function () {
    try {
      await Jobs.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "job2",
    salary: 85000,
    equity: "0.2",
  };

  test("works", async function () {
    let job = await Jobs.update(testJobIds[1], updateData);
    expect(job).toEqual({
      id: testJobIds[1],
      companyHandle: "c1",
      ...updateData,
    });
  });
  test("not found if no such job", async function () {
    try {
      await Jobs.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Jobs.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Jobs.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
